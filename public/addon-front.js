// client-side js
// run by the browser each time your view template referencing it is loaded

console.log("hello world :o");

const comments = [];
console.log(comments);
const API = "https://comment-me.glitch.me";

// define variables that reference elements on our page
const commentsForm = document.forms[0];
//const urlForm = document.forms[1];

const commentInput = commentsForm.elements["comment"];
//const urlInput = urlForm.elements["url"];

var commentUrl;
chrome.tabs.query({ active: true, lastFocusedWindow: true }, function(tabs) {
  commentUrl = tabs[0].url;
});

const commentsList = document.getElementById("comments");
//const clearButton = document.querySelector("#clear-comments");

fetch(API + "/getCommentsByURL?url=" + commentUrl)
  .then(res => res.json()).then(console.log(x))
  .then(response => {
    response.forEach(row => {
      comments.push(commentInput.value);
      appendNewComment(row.comment, row.url);
    });
  });

// a helper function that creates a list item for a given dream
const appendNewComment = (comment, url) => {
  const newListItem = document.createElement("li");
  newListItem.innerText = comment;
  commentsList.appendChild(newListItem);
};

// listen for the form to be submitted and add a new comment when it is
commentsForm.onsubmit = event => {
  if (commentInput.value) {
    // stop our form submission from refreshing the page
    event.preventDefault();

    const data = { comment: commentInput.value, url: commentUrl };

    fetch(API + "/addComment", {
      method: "POST",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" }
    })
      .then(res => res.json())
      .then(response => {
        console.log(JSON.stringify(response));
      });
    // get dream value and add it to the list
    comments.push(commentInput.value);
    appendNewComment(commentInput.value);
  }
  // reset form
  commentInput.value = "";
  commentInput.focus();
};
// listen for the form to be submitted and add a new comment when it is
// urlForm.onsubmit = event => {
//   if (urlInput.value) {
//     event.preventDefault();

//     commentsList.innerHTML = "";
//     if (urlInput.value) {
//       // stop our form submission from refreshing the page
//       event.preventDefault();
//       fetch("/getCommentsByURL?url=" + urlInput.value)
//         .then(res => res.json())
//         .then(response => {
//           response.forEach(row => {
//             appendNewComment(row.comment + "url : " + row.url);
//           });
//         });
//     } else {
//       alert("No more empty boi");
//     }
//     urlInput.focus();
//   }
// };
// clearButton.addEventListener("click", event => {
//   fetch("/clearComments", {})
//     .then(res => res.json())
//     .then(response => {
//       console.log("cleared comments");
//     });
//   commentsList.innerHTML = "";
// });
