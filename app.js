//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
// const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://0.0.0.0:27017/todolistDB", {useNewUrlParser: true});
// mongoose.connect("mongodb+srv://Azharudeen:Mynameazhar-77@cluster0.xp3sknx.mongodb.net/todolistDB", {useNewUrlParser: true});

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

const itemSchema = {
  name: String
}
const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
  name: "Welcome"
});
const item2 = new Item({
  name: "add new item"
});
const item3 = new Item({
  name: "delete item"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {

// const day = date.getDate();
  Item.find({}, function(err, foundItems) {
    // console.log(foundItems);
    if(foundItems.length === 0) {
      Item.insertMany(defaultItems, function(err) {
        if(err) {
          console.log(err);
        } else {
          console.log("Successfully saved default");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
    
  });

  // res.render("list", {listTitle: "Today", newListItems: items});

});

app.get("/:customListName", function(req, res) {
  // console.log(req.params.customListName);
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}, function(err, foundList){
    if(!err) {
      if(!foundList) {
        // console.log("Doesn't exist");
        //creste new list
        const list = new List ({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        // console.log("Exists");
        //show existing list
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items})
      }
    }
  });

  
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if(listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}, function(err, foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  //   res.redirect("/");
  // }
});

app.post("/delete", function (req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today") {
    Item.findByIdAndRemove(checkedItemId, function(err) {
      if (!err) {
        console.log("Successfully deleted id checked");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({name: listName},
      {$pull:{items: {_id: checkedItemId}}},
      function(err, foundList) {
        if(!err) {
          res.redirect("/" + listName);
        }
    });
  }

  
});

// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
