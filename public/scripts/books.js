require(['jquery'], function ($) {
  var loadDocs = function() {
    $('.book-list').html("Loading...");
    $.ajax({
      type: 'GET',
      url: "/book_list",
      //url: "http://localhost:3000/book_list",
      dataType: 'json',
      success: function(data){
        var output = Mustache.render($('.book-tpl').text(), data);
        $('.book-list').html(output);
      }
    });
  };

  loadDocs();

  $('.file-upload input[type="submit"]').on('click', function(e) {
    e.preventDefault();
    $('div.progress').removeClass('hide');
    var formData = new FormData();
    var files = document.getElementById('file').files;
    for(var f in files) {
      formData.append(f, files[f]);
    }

    var xhr = new XMLHttpRequest();      
    xhr.open('post', '/upload', true);      
    xhr.upload.onprogress = function(e) {
      if (e.lengthComputable) {
        var percentage = (e.loaded / e.total) * 100;
        $('div.progress-bar').css('width', percentage + '%');
      }
    };
    
    xhr.onerror = function(e) {
      console.log('An error occurred while submitting the form. Maybe your file is too big');
    };
    
    xhr.onload = function() {
      var result = jQuery.parseJSON( this.responseText );
      if (result.success == true) {
        // hide progress bar and refresh
        $('div.progress').addClass('hide');
        loadDocs();
      }
      console.log(this.statusText);
    };
    
    xhr.send(formData);

  });


  $('.upload-show-btn').click(function(e){
    e.preventDefault();
    if ( $('.upload-form').is( ":hidden" ) ) {
      $('.upload-form').slideDown( "slow" );
    } else {
      $('.upload-form').slideUp("slow", function(){
        $(this).hide();
      });
    }
  });

});


    