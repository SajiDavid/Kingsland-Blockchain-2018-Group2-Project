
function hideMessageBox(){
  var element = document.getElementById('messagebox');
  //document.getElementsByClassName("messagebox").hidden = true;
  element.style.visibility='hidden';
  element.style.display='none';

}
//var $ = require("jquery");

// $("#formId").submit(function (event) {
//   $.post('/route', $("#formId").serialize(), function (data) {
//  	console.log(data) //data is the response from the backend
//   });
//   event.preventDefault();
// });
// console.log('Client-side code running');

// const button = document.getElementById('myButton');
// button.addEventListener('click', function(e) {
//   console.log('button was clicked');
//   fetch('/clicked', {method: 'POST'})
//   .then(function(response) {
//     if(response.ok) {
//       console.log('Click was recorded');
//       return;
//     }
//     throw new Error('Request failed.');
//   })
//   .catch(function(error) {
//     console.log(error);
//   });
// });

function Alert(){


 
  /*
    var nodeForm = document.getElementsByName("nodeForm")
    var localhost = 
    document.getElementsByName("hostname");
    var port = 
        document.getElementsByName("port");
    
        localhost[0].addEventListener('input', function (event) {
       
          if(  localhost.value.length == 0){
            var lh = document.querySelector("input#hostname").focus();
            alert("Please enter localhost");
    
          }

          });

        
      if(  localhost.value.length == 0){
        var lh = document.querySelector("input#hostname").focus();
        alert("Please enter localhost");

      }

      if(port.length == 0 || port == undefined || port == ""){
        document.querySelector("input#port").focus();
        alert("Please enter port");

      }
    return;
*/

alertify.alert(data);

}

function receiveAmount(){

  // Sending and receiving data in JSON format using POST method
//
// var address = document.getElementsByName("address");

// //test data
// var USER_DATA = {
//     "address": address[0].value
// }

// var name = $("#name").val();
// $.post("http://localhost:6550/receiveform",{address:address,name:name},function(d){
// if(d=="sent")
//   {
//     console.log("Sent");
//   }
// });

/*
$.ajax({
  url: "http://localhost:5550/receiveform",  // the local Node server
  method: 'POST',
  contentType: "application/json",
  data: address,
  success: function(data){
      console.log(data); 
      //display data in cosole to see if I receive it
  }
});



$(".receiveForm").bind("submit", function(evt) {
  console.log(JSON.stringify($(".receiveForm").serializeObject()));

  $.ajax({
      url: "http://localhost:5550",
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify($(".receiveForm").serializeObject()),
      success: function (data, textStatus, jqXHR) {
          // do something with your data here.
      },
      error: function (jqXHR, textStatus, errorThrown) {
          // likewise do something with your error here.
      }
  });

  return false;
});

*/

  //alert("Receive Amount..");

}
