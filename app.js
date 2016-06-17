var express = require('express');
var app=express();
var bodyParser=require('body-parser');
var mongoose = require('mongoose');
var methodOverride=require('method-override');

// App config
mongoose.connect("mongodb://localhost/tumblrblog_app");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));
app.use(methodOverride("_method"));
app.set('view engine','ejs');

//Blog Schema

var blogSchema = new mongoose.Schema ({
	title: String,
	image: String,
	body: String,
	comments: [
		{
			type: mongoose.Schema.Types.ObjectId, //stores comment ID, not actual comment
			ref: "Comment" //name of Model
		}
	]

})

//Blog model

var Blog = mongoose.model("Tumblrblog", blogSchema);

//Comment Schema

var commentSchema = new mongoose.Schema ({
	text: String,
	author: String
})

// Comment Model

var Comment = mongoose.model("Comment", commentSchema);


// Blog.create(
// 	{
// 		title: 'Sunset Overdrive', 
//  	image: 'http://stebz.com/topvideogames/img/sunsetoverdrive.jpg',
// 		body: "Play Sunset Overdrive!",
// 	}, function (err, blog){
// 		if(err){
// 			console.log(err)
// 		} else {
// 			console.log("Newly created blog")
// 			 console.log(blog);
// 		}
// 	});



//Landing Page
app.get('/', function(req, res){
	res.render("landing")
});

//1) Index Page
app.get('/blog', function(req,res) {
		Blog.find({}, function(err, oneblog) { // finds all campgrounds(title,image,body) in "Blog" database
			if(err){
				console.log(err);
			} else {
				res.render("index", {myblogs: oneblog});
			}
	});
});

// 2) NEW: form for adding a new campground
app.get("/blog/new", function(req, res) {
	res.render("new")
})

//3) CREATE: Posting a new campground to the /campgrounds page
app.post("/blog", function(req, res) {
	Blog.create(req.body.blog, function(err, newBlogAdded){ // "blog" from req.body.blog is taken from name=blog[title], blog[image], blog[body]
		if(err){
			console.log(err)
		} else {
			//Redirect to the index
			res.redirect("/blog");
			console.log("new blog has been added")
			console.log(req.body.blog) // "Posts" { title: '', body: '', image: ''} to blog page. Use "req.body.blog if using"
			
		}
	})
});

// //4) SHOW: Info for one campground before comments
// app.get("/blog/:id", function(req, res) {
// 	//find the campground with provided ID
// 	Blog.findById(req.params.id, function(err, oneblog){ // console.log(req.params) =  {id: 'jlj329urnfls'}. console.log(req.params.id) = 'jlj329urnfls' 
// 		if(err){
// 			console.log(err);
// 		} else {
// 			//render show template with that campground
// 			res.render("show", {myblog: oneblog});
// 		}
// 	}); 
// })

//4.1) Show: With comments
app.get("/blog/:id", function(req, res) {
	//find the campground with provided ID
Blog.findById(req.params.id).populate("comments").exec(function(err, oneblog) { // show page now populates comments
		if(err){
			console.log(err);
		} else {
			//render show template with that campground
			res.render("show", {myblog: oneblog});
			console.log(oneblog) // shows comments with campground info
		}
	}); 
})


//5) Edit Route (this is set up )
app.get("/blog/:id/edit", function(req, res){
		Blog.findById(req.params.id, function(err, editblog) { // finds all campgrounds in database
			if(err){
				console.log(err);
			} else {
				res.render("edit", {blogEdit: editblog});
			}
	});
});


//6) Update route
app.put('/blog/:id', function(req, res){
	Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, UpdatedBlog){ // takes (id, newData, callback)
		if(err){
				res.redirect("/blog");
			} else {
				res.redirect("/blog"); // blog page
			}
	});
});

//7) Delete route
app.delete("/blog/:id", function (req, res){
	//destroy blog
	Blog.findByIdAndRemove(req.params.id, function(err){
		if(err){
			res.redirect("/blog")
		} else {
			res.redirect("/blog")
		}
	});
});

//Comment Section

//Comment form
app.get("/blog/:id", function(req, res) {
	//find the campground with provided ID
	Blog.findById(req.params.id, function(err, blog){ // blog represents data for blog
		if(err){
			console.log(err);
		} else {
			//render show template with that campground
			res.render("show", {myblog: blog});
		}
	});
});


//Posting comments to the show page
app.post("/blog/:id/comments", function(req, res){
	//look up campground using id
	Blog.findById(req.params.id, function(err, newBlogAdded){ // "newBlogAdded" represents data for Blog
			if(err) {
			console.log(err);
			} else {
			Comment.create(req.body.comment, function (err, comment){ // "comment" in req.body.comment is taken from name attribute in newcomment.ejs= req.body.comment = { text: '', body: '', author: ''}. If you want to just grab text, type req.body.text
				if(err) {
					console.log(err); 
				} else {
					newBlogAdded.comments.push(comment); // "comment" = req.body.comment
					newBlogAdded.save();
					res.redirect('/blog/' + newBlogAdded._id);
				}
			});
		}
	});
});

app.listen(7000, function(){
	console.log("Server Blog is running")
});





