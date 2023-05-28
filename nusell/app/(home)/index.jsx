import { useState, useEffect } from 'react';
import { StyleSheet, View, FlatList, Image } from 'react-native';
import { Text } from 'react-native-paper';
import { supabase } from '../../lib/supabase';
import { SearchBar } from 'react-native-screens';
import { HeaderBar } from '../(auth)/_layout.jsx';

export default function HomePage() {
    const [posts, setPosts] = useState([]);
    const [refresh, setRefresh] = useState(false);

    async function fetchPosts() {
        let { data } = await supabase.from('posts').select('*');
        setPosts(data);
        setRefresh(false);
    }
    
    useEffect(() => {  
        fetchPosts();
    }, []);

    useEffect(() => {
        if (refresh) {
            fetchPosts();
        }
    }, [refresh]);

  return (
    <View style={{ flex: 1, justifyContent: 'center'}}>
        <FlatList 
            data={posts}
            renderItem={({ item }) => <PostItem post={item}/>} 
            refreshing={refresh}
            onRefresh={() => setRefresh(true)}
            />
    </View>
    );
}

// Function to render posts in the home feed.
// Since yet to be able to set username and profile pics, defaulted to liNUS
function PostItem({ post }) {
    return (
        
        <View style={styles.postslayout}>
            <HeaderBar />
            <SearchBar />
            <Post username="liNUS" image={post.image_url} caption={post.caption} />
        </View>
    );
}

function Avatar() {
    return (
    <View style={styles.avatarContainer}>
      <Image 
      style={styles.avatar}
      source={{ uri: "https://pbs.twimg.com/media/DiRqvKmVMAMqWCQ.jpg" }} />
    </View>
    );
    }

    function Header({username}) {
        return (
        <View style={styles.headerContainer}>
          <Avatar />
          <Text>{username}</Text>
        </View>)
      }
     
      export function Post(props) {
        const { username, image, caption } = props;
        return (
          <View style={styles.postContainer}>
            <Header username={username} />
            <Image style={styles.postImage} source={{ uri: image }} />
            <Text>{caption}</Text>
          </View>
        );
      }
      
      const styles = StyleSheet.create({
        avatarContainer: {backgroundColor: 'white' },
        avatar: {
          width: 35,
          height: 35,
          borderRadius: 100/2,
          marginRight: 5,
          borderColor: '#003D7C',
          borderWidth: 2
        },
        headerContainer: {
          flexDirection: 'row',
          alignItems: 'center',
        },
        postImage: {
          width: 175,
          height: 175,
        },
        postContainer: {
          backgroundColor: 'white',
          borderWidth: 1,
          borderRadius: 10,
          borderColor: 'black',
        },
        postslayout: {
            flexDirection: 'row'
        }
      });
      
