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
    <div style={{
      maxWidth: '1000px', // Reduced from 1200px
      margin: '40px auto',
      padding: '30px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif',
      display: 'grid',
      gridTemplateColumns: '400px 1fr', // Increased left column from 350px to 400px
      gap: '30px'
    }}>
      {/* Left Column - Profile and Create Post */}
      <div>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '10px',
          padding: '20px',
          marginBottom: '20px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            <h2 style={{
              color: '#1DA1F2',
              margin: 0,
              fontSize: '24px'
            }}>Your Profile</h2>
            <button
              onClick={handleSignOut}
              style={{
                backgroundColor: '#15202b',
                color: 'white',
                border: 'none',
                borderRadius: '20px',
                padding: '10px 20px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'background-color 0.2s'
              }}
            >
              Sign Out
            </button>
          </div>
        </div>

        <div style={{
          backgroundColor: 'white',
          borderRadius: '10px',
          padding: '20px',
          marginBottom: '20px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          position: 'sticky',
          top: '20px' // Sticky positioning
        }}>
          <h3 style={{ color: '#15202b', marginTop: 0 }}>Create a New Post</h3>
          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="What's on your mind?"
            style={{
              width: '100%',
              padding: '15px',
              marginBottom: '15px',
              borderRadius: '8px',
              border: '1px solid #e1e8ed',
              fontSize: '16px',
              resize: 'vertical',
              minHeight: '150px', // Increased from 100px
              boxSizing: 'border-box',
              outline: 'none'
            }}
          />
          <button
            onClick={handleCreatePost}
            style={{
              backgroundColor: '#1DA1F2',
              color: 'white',
              border: 'none',
              borderRadius: '20px',
              padding: '12px 20px', // Increased padding
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'background-color 0.2s',
              width: '100%' // Make button full width
            }}
          >
            Post
          </button>
        </div>
      </div>

      {/* Right Column - Posts Feed */}
      <div style={{ maxWidth: '500px' }}> {/* Added maxWidth to posts container */}
        <h3 style={{ color: '#15202b', marginTop: 0 }}>Your Posts</h3>
        {posts.length > 0 ? (
          posts.map((post) => (
            <div 
              key={post.id} 
              style={{
                backgroundColor: 'white',
                borderRadius: '10px',
                padding: '20px',
                marginBottom: '20px',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
              }}
            >
              <p style={{ fontSize: '16px', margin: '0 0 15px 0' }}>{post.content}</p>
              <small style={{ color: '#657786' }}>
                Posted on: {new Date(post.timestamp?.seconds * 1000).toLocaleString()}
              </small>
              
              <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => handleLikePost(post.id)}
                  style={{
                    backgroundColor: likedPosts[post.id] ? '#E1E8ED' : '#1DA1F2',
                    color: likedPosts[post.id] ? '#1DA1F2' : 'white',
                    border: 'none',
                    borderRadius: '20px',
                    padding: '8px 16px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'all 0.2s'
                  }}
                >
                  {likedPosts[post.id] ? '❤️ Liked' : '🤍 Like'}
                </button>
                <button
                  onClick={() => handleDeletePost(post.id)}
                  style={{
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '20px',
                    padding: '8px 16px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'background-color 0.2s'
                  }}
                >
                  Delete
                </button>
              </div>

              {/* Comments Section */}
              <div style={{ marginTop: '20px' }}>
                <h4 style={{ color: '#15202b', marginBottom: '15px' }}>Comments</h4>
                {comments[post.id] && comments[post.id].map((comment) => (
                  <div 
                    key={comment.id} 
                    style={{
                      backgroundColor: '#F5F8FA',
                      borderRadius: '8px',
                      padding: '12px',
                      marginBottom: '10px'
                    }}
                  >
                    <p style={{ margin: '0 0 8px 0' }}>{comment.text}</p>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <small style={{ color: '#657786' }}>
                        {new Date(comment.timestamp?.seconds * 1000).toLocaleString()}
                      </small>
                      {comment.userId === auth.currentUser.uid && (
                        <button
                          onClick={() => handleDeleteComment(post.id, comment.id)}
                          style={{
                            backgroundColor: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '15px',
                            padding: '5px 12px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            transition: 'background-color 0.2s'
                          }}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                <textarea
                  value={newComment[post.id] || ''}
                  onChange={(e) => setNewComment(prevNewComment => ({
                    ...prevNewComment,
                    [post.id]: e.target.value,
                  }))}
                  placeholder="Write a comment..."
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #e1e8ed',
                    marginBottom: '10px',
                    fontSize: '14px',
                    resize: 'vertical',
                    minHeight: '50px',
                    boxSizing: 'border-box',
                    outline: 'none'
                  }}
                />
                <button
                  onClick={() => handleAddComment(post.id)}
                  style={{
                    backgroundColor: '#28A745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '20px',
                    padding: '8px 16px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'background-color 0.2s'
                  }}
                >
                  Add Comment
                </button>
              </div>
            </div>
          ))
        ) : (
          <p style={{ 
            textAlign: 'center', 
            color: '#657786', 
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '10px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
          }}>
            You have no posts yet.
          </p>
        )}
      </div>
    </div>
  );
}

export default Profile;