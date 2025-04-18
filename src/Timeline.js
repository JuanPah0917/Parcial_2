import React, { useState, useEffect } from 'react';
import { auth, db } from './firebaseConfig';
import { collection, query, orderBy, getDocs, addDoc, deleteDoc, doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

const getUserInfo = async (uid) => {
  const userDoc = await getDoc(doc(db, 'users', uid));
  if (userDoc.exists()) {
    return userDoc.data();
  }
  return null;
};

function Timeline() {
  const [posts, setPosts] = useState([]);
  const [newPostText, setNewPostText] = useState('');
  const currentUser = auth.currentUser;
  const [replyText, setReplyText] = useState('');
  const [replyingToPostId, setReplyingToPostId] = useState(null);
  const [visibleReplies, setVisibleReplies] = useState({});

  const fetchTimelinePosts = async () => {
    if (currentUser) {
      const postsRef = collection(db, 'posts');
      const q = query(postsRef, orderBy('createdAt', 'desc')); // Elimina la condición where para mostrar todos los posts
      const querySnapshot = await getDocs(q);
      const timelinePosts = [];
      for (const doc of querySnapshot.docs) {
        const postData = doc.data();
        const user = await getUserInfo(postData.userId);
        const likesSnapshot = await getDocs(collection(db, 'posts', doc.id, 'likes'));
        timelinePosts.push({
          id: doc.id,
          ...postData,
          likesCount: likesSnapshot.size,
          displayName: user ? user.displayName : 'Usuario Desconocido',
        });
      }
      setPosts(timelinePosts);
    } else {
      setPosts([]);
    }
  };

  useEffect(() => {
    fetchTimelinePosts();
  }, [currentUser]);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (newPostText.trim()) {
      try {
        await addDoc(collection(db, 'posts'), {
          userId: currentUser.uid,
          text: newPostText,
          createdAt: serverTimestamp()
        });
        setNewPostText('');
        fetchTimelinePosts();
      } catch (error) {
        console.error("Error creating post: ", error);
      }
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      await deleteDoc(doc(db, 'posts', postId));
      fetchTimelinePosts();
    } catch (error) {
      console.error("Error deleting post: ", error);
    }
  };

  const handleLike = async (postId) => {
    if (currentUser) {
      const likeRef = doc(collection(db, 'posts', postId, 'likes'), currentUser.uid);
      const likeSnapshot = await getDoc(likeRef);

      if (likeSnapshot.exists()) {
        await deleteDoc(likeRef);
      } else {
        await setDoc(likeRef, {});
      }
      fetchTimelinePosts();
    } else {
      alert('Debes iniciar sesión para dar like.');
    }
  };

  const handleReplyClick = (postId) => {
    setReplyingToPostId(postId);
    setReplyText('');
  };

  const handleSendReply = async (postId) => {
    if (currentUser && replyText.trim()) {
      try {
        await addDoc(collection(db, 'posts', postId, 'replies'), {
          userId: currentUser.uid,
          text: replyText,
          createdAt: serverTimestamp()
        });
        setReplyText('');
        setReplyingToPostId(null);
        fetchReplies(postId);
      } catch (error) {
        console.error("Error sending reply: ", error);
      }
    } else if (!currentUser) {
      alert('Debes iniciar sesión para responder.');
    } else {
      alert('La respuesta no puede estar vacía.');
    }
  };

  const fetchReplies = async (postId) => {
    const repliesRef = collection(db, 'posts', postId, 'replies');
    const q = query(repliesRef, orderBy('createdAt', 'asc'));
    const querySnapshot = await getDocs(q);
    const repliesData = [];
    for (const doc of querySnapshot.docs) {
      const replyData = doc.data();
      const user = await getUserInfo(replyData.userId);
      repliesData.push({
        id: doc.id,
        ...replyData,
        displayName: user ? user.displayName : 'Usuario Desconocido',
      });
    }
    setVisibleReplies(prev => ({ ...prev, [postId]: repliesData }));
  };

  const handleViewReplies = (postId) => {
    if (visibleReplies[postId]) {
      setVisibleReplies(prev => ({ ...prev, [postId]: null }));
    } else {
      fetchReplies(postId);
    }
  };

  return (
    <div>
      <h2>Mi Timeline</h2>
      {currentUser && (
        <form onSubmit={handleCreatePost}>
          <textarea
            value={newPostText}
            onChange={(e) => setNewPostText(e.target.value)}
            placeholder="¿Qué estás pensando?"
          />
          <button type="submit">Publicar</button>
        </form>
      )}
      {posts.length === 0 ? (
        <p>No has publicado nada aún.</p>
      ) : (
        <ul>
          {posts.map((post) => (
            <li key={post.id}>
              <strong>{post.displayName}:</strong> {post.text}
              {currentUser && post.userId === currentUser.uid && (
                <button onClick={() => handleDeletePost(post.id)}>Eliminar</button>
              )}
              {currentUser && (
                <button onClick={() => handleLike(post.id)}>
                  Like ({post.likesCount})
                </button>
              )}

              {currentUser && (
                <button onClick={() => handleReplyClick(post.id)}>Responder</button>
              )}

              {replyingToPostId === post.id && (
                <div>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Escribe tu respuesta..."
                  />
                  <button onClick={() => handleSendReply(post.id)}>Enviar Respuesta</button>
                  <button onClick={() => setReplyingToPostId(null)}>Cancelar</button>
                </div>
              )}

              {currentUser && (
                <button onClick={() => handleViewReplies(post.id)}>
                  {visibleReplies[post.id] ? 'Ocultar Respuestas' : 'Ver Respuestas'}
                </button>
              )}

              {visibleReplies[post.id] && (
                <ul>
                  {visibleReplies[post.id].map((reply) => (
                    <li key={reply.id}>
                      <strong>{reply.displayName}:</strong> {reply.text}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Timeline;