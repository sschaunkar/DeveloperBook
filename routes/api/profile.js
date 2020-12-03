const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const Profile = require("../../models/profile");
const User = require("../../models/User");
const { check, validationResult } = require("express-validator");
const request = require('request');
const config = require('config');

//@route    GET api/profile/me
//@desc     Get Current User profile
//@access   private

router.get("/me", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.user.id,
    }).populate("user", ["name", "avatar"]);
    if (!profile) {
      res.status(400).json({ msg: "There is no profile for this user" });
    }
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

//@route    GET api/profile/me
//@desc     Get Current User profile
//@access   private

router.post(
  "/",
  [
    auth,
    [
      check("status", "Status is Required").not().isEmpty(),
      check("skills", "Skills is Required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      company,
      website,
      location,
      status,
      skills,
      bio,
      gitusername,
      youtube,
      facebook,
      twitter,
      instagram,
      linkedin,
    } = req.body;

    // Build profile Object
    const profileFields = {};
    profileFields.user = req.user.id;
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (status) profileFields.status = status;
    if (bio) profileFields.bio = bio;
    if (gitusername) profileFields.gitusername = gitusername;
    if (skills) {
      profileFields.skills = skills.split(",").map((skill) => skill.trim());

      console.log(profileFields.skills);
    }

    // Build Social Object

    profileFields.social = {};
    if (youtube) profileFields.social.youtube = youtube;
    if (facebook) profileFields.social.facebook = facebook;
    if (instagram) profileFields.social.instagram = instagram;
    if (linkedin) profileFields.social.linkedin = linkedin;
    if (twitter) profileFields.social.twitter = twitter;

    try {
      let profile = await Profile.findOne({ user: req.user.id });
      if (profile) {
        //Update
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        );
        return res.json(profile);
      }
      //Create
      profile = new Profile(profileFields);
      await profile.save();
      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

//@route    GET api/profile
//@desc     Get all User Profiles
//@access   public

router.get("/", async (req, res) => {
  try {
    const profiles = await Profile.find().populate("user", ["name", "avatar"]);
    res.json(profiles);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

//@route    GET api/profile/user/:user_id
//@desc     Get the user with specific id
//@access   public

router.get("/user/:user_id", async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.user_id,
    }).populate("user", ["name", "avatar"]);
    if (!profile) {
      return res.status(400).send({msg:"Profile not Found"});
    }
    res.json(profile);
  } catch (err) {
    console.error(err);
    if(err.kind == 'ObjectId') 
      return res.status(400).send({msg:"Profile not Found"});
    res.status(500).send("Server Error");
  }
});

//@route    DELETE api/profile
//@desc     delete profile, user
//@access   private

router.delete("/", auth, async (req, res) => {
    try {
        //@todo remove users post

        // remove profile
      await Profile.findOneAndRemove({ user:req.user.id });
      //remove user
      await User.findOneAndRemove({ _id:req.user.id });
      res.json({ msg: 'User Deleted' });

    } catch (err) {
        res.status(500).send("Server Error");

    }
  });

//@route    PUT api/profile/experience
//@desc     Add profile Experience
//@access   private
router.put('/experience', [auth,[
    check('title','title is required').not().isEmpty(),
    check('company','company is required').not().isEmpty(),
    check('from','from date is required').not().isEmpty()
]], async (req,res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
return res.status(400).json({errors : errors.array() });
    }

    const { title,company, location, from,to, current, description } = req.body;
    const newExp = { title,company, location, from,to, current, description };
    try {
        const profile = await Profile.findOne({ user:req.user.id });
        profile.experience.unshift(newExp);
        await profile.save();
        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
        
    }
});

//@route    DELETE api/profile/experience/:exp_id
//@desc     Delete profile Experience from profile
//@access   private

router.delete('/experience/:exp_id',auth,async (req,res)=>{
try {
    const profile = await Profile.findOne({ user: req.user.id });
    //Get remove index
    const removeIndex = profile.experience.map(item => item.id).indexOf(req.params.exp_id);
    console.log(removeIndex);
    profile.experience.splice(removeIndex,1);
    await profile.save();
    res.json(profile);
} catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
}   
});

//@route    PUT api/profile/education
//@desc     Add education in profile
//@access   private
router.put('/education', [auth,[
    check('school','school is required').not().isEmpty(),
    check('degree','degree is required').not().isEmpty(),
    check('fieldofstudy','fieldofstudy is required').not().isEmpty(),
    check('from','from is required').not().isEmpty()
]], async (req,res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
return res.status(400).json({errors : errors.array() });
    }

    const { school,degree, fieldofstudy, from,to, description } = req.body;
    const newEducation = { school,degree, fieldofstudy, from,to, description };
    try {
        const profile = await Profile.findOne({ user:req.user.id });
        profile.education.unshift(newEducation);
        await profile.save();
        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
        
    }
});

//@route    DELETE api/profile/education/:edu_id
//@desc     Delete education from profile
//@access   private

router.delete('/education/:edu_id',auth,async (req,res)=>{
    try {
        const profile = await Profile.findOne({ user: req.user.id });
        //Get remove index
        const removeIndex = profile.education.map(item => item.id).indexOf(req.params.edu_id);
        profile.education.splice(removeIndex,1);
        await profile.save();
        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }   
    });

//@route    GET github/:username:edu_id
//@desc     Get github repos
//@access   public

router.get('/github/:username', async (req,res)=>{
  try {
      const options = {
        uri:`http://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc&client_id=${config.get('githubClientID')}&client_secret=${config.get('githubClientSecret')}`, 
        method:'GET',
        headers:{'user-agent':'node.js'}
      };
      request(options,(error,response,body)=>{
        if(error) console.error(error);
        if(response.statusCode !== 200){
          res.status(404).send('No Github profile found');
          console.log(body);
        }
        res.json(JSON.parse(body));
      });
  } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
  }   
  });


  

module.exports = router;
