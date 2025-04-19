import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebaseConfig';
import { collection, addDoc, getDocs, query, where, serverTimestamp, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

function Profile() {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      navigate('/'); // Redirect to the main page after signing out
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const fetchPosts = async () => {
    try {
      const postsRef = collection(db, 'posts');
      const q = query(
        postsRef,
        where('userId', '==', auth.currentUser.uid),
        orderBy('timestamp', 'desc') // Ordenar por timestamp en orden descendente
      );
      const querySnapshot = await getDocs(q);
      const userPosts = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPosts(userPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.trim()) {
      alert('Post content cannot be empty.');
      return;
    }
  
    if (!auth.currentUser) {
      alert('You must be signed in to create a post.');
      return;
    }
  
    try {
      console.log('Creating post with the following data:');
      console.log('User ID:', auth.currentUser.uid);
      console.log('Content:', newPost);
  
      const post = {
        userId: auth.currentUser.uid, // ID del usuario autenticado
        content: newPost,
        timestamp: serverTimestamp(),
      };
      await addDoc(collection(db, 'posts'), post);
      setNewPost('');
      fetchPosts(); // Actualizar la lista de publicaciones
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      const postRef = doc(db, 'posts', postId);
      await deleteDoc(postRef);
      fetchPosts(); // Actualizar la lista de publicaciones
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h2>Welcome to Your Profile</h2>
      <button
        onClick={handleSignOut}
        style={{ backgroundColor: '#f0f0f0', border: '1px solid #ccc', padding: '10px', cursor: 'pointer', marginBottom: '20px' }}
      >
        Sign Out
      </button>

      <h3>Create a New Post</h3>
      <textarea
        value={newPost}
        onChange={(e) => setNewPost(e.target.value)}
        placeholder="Write something..."
        style={{ width: '100%', padding: '10px', marginBottom: '10px', height: '100px' }}
      />
      <button
        onClick={handleCreatePost}
        style={{ padding: '10px', backgroundColor: '#007BFF', color: '#fff', border: 'none', cursor: 'pointer' }}
      >
        Post
      </button>

      <h3>Your Posts</h3>
      {posts.length > 0 ? (
        posts.map((post) => (
          <div key={post.id} style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
            <p>{post.content}</p>
            <small>Posted on: {new Date(post.timestamp?.seconds * 1000).toLocaleString()}</small>
            <button
              onClick={() => handleDeletePost(post.id)}
              style={{
                backgroundColor: '#dc3545',
                color: '#fff',
                border: 'none',
                padding: '5px 10px',
                cursor: 'pointer',
                marginLeft: '10px',
              }}
            >
              Delete
            </button>
          </div>
        ))
      ) : (
        <p>You have no posts yet.</p>
      )}
    </div>
  );
}

export default Profile;