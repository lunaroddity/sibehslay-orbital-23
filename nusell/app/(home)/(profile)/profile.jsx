import { View, Image, StyleSheet, FlatList,  Dimensions, TouchableHighlight } from "react-native";
import { Button, SegmentedButtons, Text } from 'react-native-paper';
import { supabase } from "../../../lib/supabase";
import { HeaderBar } from '../../(auth)/_layout.jsx';
import { useRouter } from 'expo-router';
import { useAuth } from "../../../contexts/auth";
import { useEffect, useState } from "react";

const { width, height } = Dimensions.get('screen');
const halfWidth = width / 2;

export default function ProfilePage() {
  const [profile, setProfile] = useState([]);
  const [posts, setPosts] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [avatar, setAvatar] = useState('');
  const [value, setValue] = useState('posts');
  const router = useRouter();
  const { user } = useAuth();

  async function fetchProfile() {
    let { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    console.log(`profileData: ${JSON.stringify(data)}`);
    setAvatar(data.avatar);
    setProfile(data);
  }

  async function fetchPosts() {
    let { data } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', user.id)
        .order('inserted_at', { ascending: false });
    console.log('Posts data:', data);
    setPosts(data);
  }

  async function fetchLikes() {
    //retrieve array of liked posts id
    let { data: likearray } = await supabase
      .from('likes')
      .select('likedposts')
      .eq('user_id', user.id);

    if (likearray.length > 0) {
      console.log('Liked Post IDs:', likearray);

      //retrieve array of posts (from array of liked posts id)
      const { data: likepostdata } = await supabase
        .from('posts')
        .select('*')
        .in('id', likearray[0].likedposts)
        .order('inserted_at', { ascending: false });

      console.log('Liked Posts Data:', likepostdata);

      setPosts(likepostdata);
    } else {
      console.log('No liked posts found for user');
    }
  }
    

  // Initial data fetch on loading
  useEffect(() => {  
    fetchProfile();
    fetchPosts();
  }, []);

  // Data fetch upon pull to refresh
  useEffect(() => {
    if (refresh) {
      fetchProfile();
      fetchPosts();
      setValue('posts');
      setRefresh(false);
    }
  }, [refresh]);

  useEffect(() => {
    if (value === 'posts') {
      fetchPosts();
    } else if (value === 'likes') {
      fetchLikes();
    }
  }, [value])

  const oldAvatar = encodeURIComponent(avatar);

  return (
      <View style={styles.view}>
        <HeaderBar />
        <Header 
          firstName={profile.firstName}
          lastName={profile.lastName}
          username={profile.username}
          avatar={avatar}
        />          
        <Button
          style={styles.button}
          mode="outlined"
          outlineColor ="#003D7C"
          rippleColor="#ccc" 
          textColor='black'
          onPress={() => {
            router.push({pathname: "(profile)/editProfile",
              params: { 
                oldFirstName: profile.firstName,
                oldLastName: profile.lastName,
                oldUsername: profile.username,
                oldAvatar: oldAvatar}})}}>Edit Profile</Button>
        <SegmentedButtons
          style={styles.button}
          value={value}
          onValueChange={setValue}
          theme={{colors: {secondaryContainer: "#003D7C", onSecondaryContainer:"#fff"}}}
          buttons={[
            {
              value: 'posts',
              label: 'Your Posts',
            },
            {
              value: 'likes',
              label: 'Your Likes',
            }
          ]}
        />
        {(value === 'posts') && <FlatList 
          data={posts}
          numColumns={2}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <PostItem post={item} />}
          refreshing={refresh}
          onRefresh={() => setRefresh(true)}
        />}
        {(value === 'likes') && <FlatList 
          data={posts}
          numColumns={2}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <PostItem post={item} />}
          refreshing={refresh}
          onRefresh={() => setRefresh(true)}
        />}
      </View>
  )
}

function Header(props) {
  const { firstName, lastName, username, avatar } = props;
  return (
    <View style={styles.headerContainer}>
      <UsernameAvatar username={username} avatar={avatar} />
      <Name firstName={firstName} lastName={lastName} />
    </View>
  );
}

function UsernameAvatar(props) {
  const { username, avatar } = props;
  return (
      <View style={styles.usernameAvatar}>
          <Avatar avatar={avatar} />
          <Text style={styles.username}>{username}</Text>
      </View>
  )
}

export function Avatar(props) {
  const { avatar } = props;

    return (
      <View>
        <Image 
          style={styles.avatar}
          source={{ uri: avatar }} />
      </View>
    );
  }

  function Name(props) {
    const { firstName, lastName } = props;
    const name = firstName + " " + lastName;

    return (
        <View style={styles.name}>
          <Text style={{ fontSize: 14 }}>{name}</Text>
        </View>
    )
  }

  function PostItem({ post }) {
    const router = useRouter();
      return (
        <View>
          <TouchableHighlight 
            onPress={() => router.push({ pathname: "(profile)/viewPost", params: { id: post.id }})
          }>
            <View style={styles.postContainer}>
              <Image style={styles.postImage} source={{ uri: post.image_url }} />
              <Text style={styles.title}>{post.title}</Text>
              <Text style={styles.price}>${post.price}</Text>
            </View>
          </TouchableHighlight>
        </View>
      );
  }

  export const styles = StyleSheet.create({
    view: {
      flex: 1,
      justifyContent: 'flex-start',
      backgroundColor: "#fff"
    },
    avatar: {
      width: 60,
      height: 60,
      borderRadius: 50,
    },
    headerContainer: {
        marginTop: 10,
        padding: 8,
        backgroundColor: 'white',
        marginHorizontal: 10,
    },
    usernameAvatar: {
        flexDirection: "row",
        alignItems: 'center',
    },
    username: {
      marginLeft: 5,
      fontWeight: "bold",
      fontSize: 20
    },
    name: {
      flexDirection: "row",
      marginVertical: 5,
    },
    button: {
      marginHorizontal: 10,
      marginBottom: 5,
    },
    postImage: {
      width: 160,
      height: 160,
    },
     title: {
      paddingHorizontal: 5,
      paddingVertical: 3,
      fontWeight: 'bold',
    },
    price: {
      paddingHorizontal: 5,
    },
    postContainer: {
      width: halfWidth,
      alignItems: 'flex-start',
      backgroundColor: 'white',
      padding: 10,
    }
});