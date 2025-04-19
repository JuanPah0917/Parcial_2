import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebaseConfig';
import { collection, addDoc, getDocs, query, where, serverTimestamp, orderBy, deleteDoc, doc, updateDoc, arrayUnion, arrayRemove, increment } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

function Profile({ setEmail, setPassword }) {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const navigate = useNavigate();
  const [likedPosts, setLikedPosts] = useState({});
  const [comments, setComments] = useState({}); // Track comments for each post
  const [newComment, setNewComment] = useState({}); // Track new comment input for each post

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      setEmail('');
      setPassword('');
      navigate('/');
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
        orderBy('timestamp', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const userPosts = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPosts(userPosts);

      // Initialize liked posts and comments
      const initialLikedPosts = {};
      const initialComments = {};
      userPosts.forEach(post => {
        initialLikedPosts[post.id] = post.likedBy && post.likedBy.includes(auth.currentUser.uid);
        initialComments[post.id] = []; // Initialize with an empty array for comments
      });
      setLikedPosts(initialLikedPosts);
      setComments(initialComments);

      // Fetch comments for each post
      userPosts.forEach(async post => {
        await fetchComments(post.id);
      });

    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const fetchComments = async (postId) => {
    try {
      const commentsRef = collection(db, 'posts', postId, 'comments');
      const q = query(commentsRef, orderBy('timestamp', 'asc'));
      const querySnapshot = await getDocs(q);
      const postComments = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setComments(prevComments => ({
        ...prevComments,
        [postId]: postComments,
      }));
    } catch (error) {
      console.error('Error fetching comments:', error);
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
      const post = {
        userId: auth.currentUser.uid,
        content: newPost,
        timestamp: serverTimestamp(),
        likes: 0,
        likedBy: [],
      };
      await addDoc(collection(db, 'posts'), post);
      setNewPost('');
      fetchPosts();
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      const postRef = doc(db, 'posts', postId);
      await deleteDoc(postRef);
      fetchPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const handleLikePost = async (postId) => {
    try {
      const postRef = doc(db, 'posts', postId);
      const userId = auth.currentUser.uid;
      const alreadyLiked = likedPosts[postId];

      setLikedPosts(prevLikedPosts => ({
        ...prevLikedPosts,
        [postId]: !alreadyLiked,
      }));

      if (alreadyLiked) {
        await updateDoc(postRef, {
          likes: increment(-1),
          likedBy: arrayRemove(userId),
        });
      } else {
        await updateDoc(postRef, {
          likes: increment(1),
          likedBy: arrayUnion(userId),
        });
      }

    } catch (error) {
      console.error('Error liking post:', error);
      fetchPosts();
    }
  };

  const handleAddComment = async (postId) => {
    try {
      const commentText = newComment[postId];
      if (!commentText || commentText.trim() === '') {
        alert('Comment cannot be empty.');
        return;
      }

      const commentsRef = collection(db, 'posts', postId, 'comments');
      await addDoc(commentsRef, {
        userId: auth.currentUser.uid,
        text: commentText,
        timestamp: serverTimestamp(),
      });

      setNewComment(prevNewComment => ({
        ...prevNewComment,
        [postId]: '', // Clear the comment input
      }));

      fetchComments(postId); // Refresh comments
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    try {
      const commentRef = doc(db, 'posts', postId, 'comments', commentId);
      await deleteDoc(commentRef);
      fetchComments(postId); // Refresh comments
    } catch (error) {
      console.error('Error deleting comment:', error);
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
            <div>
              <button
                onClick={() => handleLikePost(post.id)}
                disabled={false}
                style={{
                  backgroundColor: likedPosts[post.id] ? '#ccc' : '#007BFF',
                  color: '#fff',
                  border: 'none',
                  padding: '5px 10px',
                  cursor: 'pointer',
                  marginRight: '10px',
                }}
              >
                {likedPosts[post.id] ? 'Liked' : 'Like'}
              </button>
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

            {/* Comments Section */}
            <div>
              <h4>Comments</h4>
              {comments[post.id] && comments[post.id].map((comment) => (
                <div key={comment.id} style={{ border: '1px solid #eee', padding: '5px', marginBottom: '5px' }}>
                  <p>{comment.text}</p>
                  <small>Commented on: {new Date(comment.timestamp?.seconds * 1000).toLocaleString()}</small>
                  {comment.userId === auth.currentUser.uid && (
                    <button
                      onClick={() => handleDeleteComment(post.id, comment.id)}
                      style={{
                        backgroundColor: '#dc3545',
                        color: '#fff',
                        border: 'none',
                        padding: '3px 6px',
                        cursor: 'pointer',
                        marginLeft: '10px',
                      }}
                    >
                      Delete Comment
                    </button>
                  )}
                </div>
              ))}

              <textarea
                value={newComment[post.id] || ''}
                onChange={(e) => setNewComment(prevNewComment => ({
                  ...prevNewComment,
                  [post.id]: e.target.value,
                }))}
                placeholder="Add a comment..."
                style={{ width: '100%', padding: '5px', marginBottom: '5px', height: '50px' }}
              />
              <button
                onClick={() => handleAddComment(post.id)}
                style={{ padding: '5px', backgroundColor: '#28A745', color: '#fff', border: 'none', cursor: 'pointer' }}
              >
                Add Comment
              </button>
            </div>
          </div>
        ))
      ) : (
        <p>You have no posts yet.</p>
      )}
    </div>
  );
}

export default Profile;