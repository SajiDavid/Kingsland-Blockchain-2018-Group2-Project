
function Alert(){
    
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

}

function receiveAmount(){

  // Sending and receiving data in JSON format using POST method
//
var address = document.getElementsByName("address");

//test data
var USER_DATA = {
    "address": address[0].value
}

$(".receiveForm").bind("submit", function(evt) {
  console.log(JSON.stringify($("#loginForm").serializeObject()));

  $.ajax({
      url: "your URL here",
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify($("#loginForm").serializeObject()),
      success: function (data, textStatus, jqXHR) {
          // do something with your data here.
      },
      error: function (jqXHR, textStatus, errorThrown) {
          // likewise do something with your error here.
      }
  });

  return false;
});


  alert("Receive Amount..");

}