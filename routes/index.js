var express = require('express');
var router = express.Router();
const userModel=require('./users');
const passport = require('passport');
const localStrategy=require('passport-local')
const upload=require('./multer')
const postModel=require('./post');
const paginate=require('mongoose-paginate')

passport.use(new localStrategy(userModel.authenticate()))

router.get('/', function(req, res, next) {
  res.render('index',{nav:true});
});    


router.get('/register', function(req, res, next) {
  res.render('register',{nav:true});
});
router.get('/profile',isLoggedIn  , async function(req, res, next) {
  const user=
  await  userModel
         .findOne({username:req.session.passport.user})
          .populate("posts");
  res.render("profile",{user,nav:false});
  // console.log(user);

});

// router.get('/feed',isLoggedIn  , async function(req, res, next) {
//   const user=
//   await  userModel
//          .findOne({username:req.session.passport.user})
//             const posts= await postModel.find()
//             .populate("user");
//             res.render("feed",{user,posts,nav:false})
// });

router.get('/show/posts',isLoggedIn  , async function(req, res, next) {
  const user=
  await  userModel
         .findOne({username:req.session.passport.user})
          .populate("posts");
          // console.log(user);
  res.render("show",{user,nav:false});

});

// router.get('/feed',isLoggedIn,async function(req,res,next){
//     const user=await userModel.findOne({username:req.session.passport.user})
//     let page=parseInt(req.query.page)||1;
//     let PostPerPage=2;
//     let totalpost=postModel.countDocuments({});
//     let totalPage=Math.ceil(totalpost/PostPerPage);
//     try{
//       let totalpost=await postModel.countDocuments({});
//       let totalPage=Math.ceil(totalpost/PostPerPage);
//       const post=await postModel.find().populate("user").skip((page-1)*PostPerPage).limit(PostPerPage);
//       res.render('feed'),{user,posts,currentPage:page,totalPage,nav:false};
//     }
//     catch(error){
//       console.log(error);
//    res.send("Internal server error");
//     }
// });
router.get('/add',isLoggedIn  , async function(req, res, next) {
  const user=await  userModel.findOne({username:req.session.passport.user});
  res.render("add",{user,nav:false});
});


router.post('/createpost',isLoggedIn ,upload.single("postimage"), async function(req, res, next) {
  const user=await  userModel.findOne({username:req.session.passport.user});
  const post = await postModel.create({
    user:user._id,
    title:req.body.title,
    description:req.body.description, 
    image:req.file.filename
  })    
  user.posts.push(post._id);
  await user.save();
  res.redirect("/profile")
});

router.post('/fileupload',  isLoggedIn, upload.single("image"),async function(req, res, next) {
    const user=await  userModel.findOne({username:req.session.passport.user});
    user.profileImage = req.file.filename;
    await user.save();
    res.redirect("/profile"); 
});

router.post('/login', passport.authenticate("local",{
    failureRedirect:"/",
    successRedirect:"/profile",
}),function(req, res, next) {
  res.render('profile');
});

router.get('/logout',function(req,res){
  req.logout(function(err){
    if(err){return next(err);}
    res.redirect('/');
  });
})

function isLoggedIn(req,res,next){
  if(req.isAuthenticated()){
    return next();
  }
  res.redirect("/");
}


router.post('/register', function(req, res, next) {
    const data=new userModel({
      username:req.body.username,
      email:req.body.email,
      contact:req.body.contact,
      name:req.body.fullname
    })
    userModel.register(data,req.body.password)
    .then(function(){
      passport.authenticate("local")(req,res,function(){
        res.redirect("/profile")
      })
    })
});
module.exports = router;
