
import React, { useEffect, useState } from 'react';
import './App.css';
import Post from './components/Post';
import { db, auth } from './firebase';
import { makeStyles } from '@material-ui/core/styles';
import Modal from '@material-ui/core/Modal';
import { Avatar, Button, Input } from '@material-ui/core';
import ImageUpload from './components/ImageUpload';
import LazyLoad from "react-lazyload";
import getUserLocale from 'get-user-locale';
import MenuPopupState from './components/MenuPopupState';
import PostThumb from './components/PostThumb'

function backToTop() {
  document.body.scrollTop = 0; // For Safari
  document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
}

function getModalStyle() {
  const top = 50;
  const left = 50;

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  };
}

const Spinner = () => (
  <div className="post loading">
    <img alt="Loading..." src="https://i.gifer.com/ZZ5H.gif" width="20" />
    <h5>Loading...</h5>
  </div>
);

const useStyles = makeStyles((theme) => ({
  paper: {
    position: 'absolute',
    width: 400,
    backgroundColor: theme.palette.background.paper,
    border: '2px solid blue',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
}));

const locale = () => {

  if (getUserLocale().includes("fr")) {
    return (true)
  } else {
    return (false)
  }
}
function App() {

  const classes = useStyles();
  const [modalStyle] = useState(getModalStyle);
  const [posts, setPosts] = useState([]);
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [user, setUser] = useState(null);
  const [openSignIn, setOpenSignIn] = useState(false);
  const [viewmine, setViewMine] = useState(false);
  const [viewwhichuser, setViewWhichUser] = useState('');
  const [viewsinglepost, setViewSinglePost] = useState(false);
  const [singlepostid, setSinglePostId] = useState('');
  const [openImageUpload, setOpenImageUpload] = useState(false);
  const [lang, setLang] = useState(locale);


  //proverava da li je korisnik ulogovan i drzi ga ulogovanog
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        console.log(authUser);
        setUser(authUser);
      } else {
        //ako se korisnik izloguje
        setUser(null);
      }
    })

    return () => {
      unsubscribe();
    }
  }, [user, username]);

  useEffect(() => {
    //Svaki put kada se postavi post, ovaj deo se pokrece
    db.collection('posts').orderBy('timestamp', 'desc').onSnapshot(snapshot => {
      setPosts(snapshot.docs.map(doc => (
        {
          id: doc.id,
          post: doc.data()
        }
      )));
    })
  }, []);


  const signUp = (event) => {

    event.preventDefault();
    auth.createUserWithEmailAndPassword(email, password).then((authUser) => {
      return authUser.user.updateProfile({
        displayName: username
      })
    }).catch((error) => alert(error.message));

    setOpen(false);
  }

  const signIn = (event) => {
    event.preventDefault();
    auth
      .signInWithEmailAndPassword(email, password)
      .catch((error) => alert(error.message));

    // Close modal
    setOpenSignIn(false);
  }

  function home() {
    setViewMine(false);
    setViewWhichUser('');
    setViewSinglePost(false);
    backToTop();
  }


  return (
    <div className="app">

      <Modal
        open={open}
        onClose={() => setOpen(false)}
      >
        <div style={modalStyle} className={classes.paper}>
          <form className="app__signup">
            <center>
              <img src="https://www.instagram.com/static/images/web/mobile_nav_type_logo.png/735145cfe0a4.png" alt="" className="app__headerImage" />
            </center>
            <Input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <Input
              placeholder="Email"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Input
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button type="submit" onClick={signUp}>Sing Up</Button>
          </form>
        </div>
      </Modal>

      <Modal
        open={openSignIn}
        onClose={() => setOpenSignIn(false)}
      >
        <div style={modalStyle} className={classes.paper}>
          <form className="app__signup">
            <center>
              <img src="https://www.instagram.com/static/images/web/mobile_nav_type_logo.png/735145cfe0a4.png" alt="" className="app__headerImage" />
            </center>

            <Input
              placeholder="Email"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Input
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button type="submit" onClick={signIn}>Sing In</Button>
          </form>

        </div>
      </Modal>
      <div className="app__header">
        <img src="https://www.instagram.com/static/images/web/mobile_nav_type_logo.png/735145cfe0a4.png" alt="" className="app__headerImage" />
        {user ? (
          <Button onClick={() => auth.signOut()}>Logout</Button>
        ) : (
            <div className="app__loginContainer">
              <Button onClick={() => setOpenSignIn(true)}>Sign In</Button>
              <Button onClick={() => setOpen(true)}>Sign Up</Button>
            </div>
          )}
      </div>
      <div className="app__posts">
        {
          // If "View my own posts button was clicked AND user is logged in"
          (viewmine && user) ? (

            <div className="post__thumbs">

              {

                posts.filter(({ id, post }) => post.username === auth.currentUser.displayName).map(({ id, post }) => (

                  // added te below div so that if anyone clicks on this it will set a variable to enable view on a single post

                  <LazyLoad
                    key={id}
                    height={100}
                    offset={[-100, 100]}
                    placeholder={<Spinner />}
                  >
                    <div onClick={() => { setViewSinglePost(true); setSinglePostId(id); setViewMine(false); setViewWhichUser(null); backToTop(); }}>

                      <PostThumb
                        key={id}
                        lang={lang}
                        postId={id}
                        user={user}
                        username={post.username}
                        caption={post.caption}
                        imageUrl={post.imageUrl}
                      />

                    </div>
                  </LazyLoad>


                ))}
            </div>


          ) : (viewwhichuser) ? ( // If we want to see other people's list of posts

            <div className="post__thumbs">

              {

                posts.filter(({ id, post }) => post.username === viewwhichuser).map(({ id, post }) => (

                  <LazyLoad
                    key={id}
                    height={100}
                    offset={[-100, 100]}
                    placeholder={<Spinner />}
                  >
                    <div onClick={() => { setViewSinglePost(true); setSinglePostId(id); setViewMine(false); setViewWhichUser(null); backToTop(); }}>
                      <PostThumb
                        key={id}
                        lang={lang}
                        postId={id}
                        user={user}
                        username={post.username}
                        caption={post.caption}
                        imageUrl={post.imageUrl}
                      />
                    </div>
                  </LazyLoad>
                  // added te below div so that if anyone clicks on this it will set a variable to enable view on a single post


                ))}
            </div>


          ) : viewsinglepost ? (

            // If a single post was selected

            posts.filter(({ id, post }) => id === singlepostid).map(({ id, post }) => (
              <Post
                key={id}
                lang={lang}
                postId={id}
                user={user}
                username={post.username}
                caption={post.caption}
                imageUrl={post.imageUrl}
                imagename={post.imagename}
                viewwhichuser={setViewWhichUser}
                viewsinglepost={setViewSinglePost}
              />
            ))

          ) : (

                  // Else if no posts were selected at all, simply default to display all posts as usual

                  posts.map(({ id, post }) => (

                    <LazyLoad
                      key={id}
                      height={100}
                      offset={[-100, 100]}
                      placeholder={<Spinner />}
                    >
                      <Post
                        key={id}
                        lang={lang}
                        postId={id}
                        user={user}
                        username={post.username}
                        caption={post.caption}
                        imageUrl={post.imageUrl}
                        imagename={post.imagename}
                        viewwhichuser={setViewWhichUser}
                        viewsinglepost={setViewSinglePost}
                      />
                    </LazyLoad>

                  ))

                )
        }
      </div>

      <footer className="footer">

        {/* This is where people can upload stuff */}
        {/* below line used to be user?.displayName ? (  - but it was giving issues so i changed it */}
        {user ? (

          <div>
            <Modal
              open={openImageUpload}
              onClose={() => setOpenImageUpload(false)}
            >
              <ImageUpload
                lang={lang}
                username={user.displayName}
                closemodal={setOpenImageUpload}
                // Passing the 2 below so that I can reset those once upload is done
                viewwhichuser={setViewWhichUser}
                viewsinglepost={setViewSinglePost}

              />
            </Modal>


            <div className="footer__icons">
              <div className="footer__left">
                <img onClick={home} className="app__home" src="https://toogreen.ca/instagreen/img/home.svg" alt='home icon to go back up' />
              </div>

              <div className="footer__middle">
                <img onClick={() => setOpenImageUpload(true)} className="app__add-postImg" src="https://toogreen.ca/instagreen/img/add-post.svg" alt='plus icon to add posts' />
              </div>

              <div className="footer__right">
                <Avatar
                  onClick={() => { setViewMine(true); backToTop(); }}
                  className="footer__avatar"
                  alt={username}
                  src="https://toogreen.ca/instagreen/static/images/avatar/1.jpg"
                />
              </div>
            </div>

          </div>
        ) : (
            <div className="footer__icons">
              <div className="footer__left">
                <img onClick={home} className="app__home" src="https://toogreen.ca/instagreen/img/home.svg" alt='home icon to go back up' />
              </div>
              <div className="footer__middle">
                <Button onClick={() => setOpenSignIn(true)}>
                  {lang ? "CONNEXION" : "SIGN IN"} &nbsp;&nbsp;
                  </Button>
                <Button onClick={() => setOpen(true)}>
                  {lang ? "INSCRIPTION" : "SIGN UP"}
                </Button>

              </div>
              <div className="footer__right">
                &nbsp;
              </div>
            </div>

          )}
      </footer>
    </div>
  );
}

export default App;
