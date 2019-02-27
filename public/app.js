function hideMessageBox() {
  var element = document.getElementById('messagebox');
  //document.getElementsByClassName("messagebox").hidden = true;
  element.style.visibility = 'hidden';
  element.style.display = 'none';

}

$(document).ready(function(){
$( ".amount" ).change(function() {
  var value = $(".amount").val();
  if(value>0){
    var feeamount = (value * 5 )/100;
    $(".nFee").text(""+feeamount);

  }
});
  $("small").click(function(){
    $(".nFee").hide();
  });
$(".deleteButton").click(function(){
  var name =  $(this).attr('name');
 $.post('/deletepeer',{host:name},function(){
  window.location.reload() });
 return false;

});


});