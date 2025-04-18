import React, { useState, useEffect } from 'react';
import { auth, db } from './firebaseConfig';
import { collection, query, where, getDocs, orderBy, doc, setDoc, serverTimestamp, deleteDoc, getDoc } from 'firebase/firestore';

function Profile() {
  const [posts, setPosts] = useState([]);
  const currentUser = auth.currentUser;
  const testUserToFollowId = 'tyBOqh7lRydnZo9H1GnkZ82Haiw2'; // Reemplaza con un UID real si tienes uno
  const [isFollowingTestUser, setIsFollowingTestUser] = useState(false);

  useEffect(() => {
    const checkIfFollowing = async () => {
      if (currentUser && testUserToFollowId) {
        const followDocRef = doc(db, 'following', `${currentUser.uid}_${testUserToFollowId}`);
        const followSnapshot = await getDoc(followDocRef);
        setIsFollowingTestUser(followSnapshot.exists());
      }
    };

    checkIfFollowing();
  }, [currentUser, testUserToFollowId]);

  const handleFollowUser = async (userToFollowId) => {
    if (currentUser && userToFollowId !== currentUser.uid) {
      try {
        const followDocId = `${currentUser.uid}_${userToFollowId}`;
        await setDoc(doc(db, 'following', followDocId), {
          followerId: currentUser.uid,
          followingId: userToFollowId,
          createdAt: serverTimestamp()
        });
        setIsFollowingTestUser(true);
        console.log(`Siguiendo al usuario con ID: ${userToFollowId}`);
        // Aquí podríamos actualizar el estado local para mostrar que se está siguiendo al usuario
      } catch (error) {
        console.error("Error al seguir al usuario: ", error);
        // Aquí podríamos mostrar un mensaje de error al usuario
      }
    } else if (!currentUser) {
      alert('Debes iniciar sesión para seguir a otros usuarios.');
    } else {
      alert('No puedes seguirte a ti mismo.');
    }
  };

  const handleUnfollowUser = async (userToUnfollowId) => {
    if (currentUser && userToUnfollowId !== currentUser.uid) {
      try {
        const followDocId = `${currentUser.uid}_${userToUnfollowId}`;
        await deleteDoc(doc(db, 'following', followDocId));
        setIsFollowingTestUser(false);
        console.log(`Dejando de seguir al usuario con ID: ${userToUnfollowId}`);
        // Aquí podríamos actualizar el estado local para reflejar que se ha dejado de seguir al usuario
      } catch (error) {
        console.error("Error al dejar de seguir al usuario: ", error);
        // Aquí podríamos mostrar un mensaje de error al usuario
      }
    } else if (!currentUser) {
      alert('Debes iniciar sesión para dejar de seguir a otros usuarios.');
    } else {
      alert('No puedes dejar de seguirte a ti mismo.');
    }
  };

  const handleFollowUnfollowClick = () => {
    if (isFollowingTestUser) {
      handleUnfollowUser(testUserToFollowId);
    } else {
      handleFollowUser(testUserToFollowId);
    }
  };

  useEffect(() => {
    const fetchUserPosts = async () => {
      if (currentUser) {
        const postsRef = collection(db, 'posts');
        const q = query(postsRef, where('userId', '==', currentUser.uid), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const userPosts = [];
        querySnapshot.forEach((doc) => {
          userPosts.push({ id: doc.id, ...doc.data() });
        });
        setPosts(userPosts);
      } else {
        setPosts([]);
      }
    };

    fetchUserPosts();
  }, [currentUser]);

  return (
    <div>
      <h2>Mi Perfil</h2>
      {currentUser && <p>Usuario: {currentUser.email}</p>}
      <h3>Mis Posts:</h3>
      {posts.length === 0 ? (
        <p>No has publicado nada aún.</p>
      ) : (
        <ul>
          {posts.map((post) => (
            <li key={post.id}>
              {post.text}
              {/* Aquí podrías añadir botones para editar o eliminar si fuera necesario */}
            </li>
          ))}
        </ul>
      )}
      {currentUser && testUserToFollowId && currentUser.uid !== testUserToFollowId && (
        <button onClick={handleFollowUnfollowClick}>
          {isFollowingTestUser ? 'Dejar de seguir Usuario de Prueba' : 'Seguir Usuario de Prueba'}
        </button>
      )}
    </div>
  );
}

export default Profile;