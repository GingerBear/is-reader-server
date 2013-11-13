define(['./pdf_render', './util'], function (pdf) {
    
    // use event delegation

    $('.nav-btn-div').on('click', function(e){
        var target = $(e.target);
        if (target.is('.next-page') || target.is('.next-page span')){
            pdf.nextPage();
        } else if (target.is('.pre-page') || target.is('.pre-page span')) {
            pdf.prePage();
        }
    });

    $('.panel-tool-div').on('click', function(e){
        var target = $(e.target);
        if (target.is('.settings-btn') || target.is('.settings-btn span')){

            $('.settings-list-div').filter(function(){
            	if ($(this).is(".hidden")) 
            		$(this).slideAndShow('right');
            	else 
            		$(this).slideAndHide('right');
            });
        } else if (target.is('.notes-list-btn') || target.is('.notes-list-btn span')) {
            
            $('.note-list-div').filter(function(){
            	if ($(this).is(".hidden")) {
            		if (!$('.settings-list-div').is('.hidden')) 
                    	$('.settings-list-div').slideAndHide('right');   
            		$(this).slideAndShow('right');
            	} else {
            		$(this).slideAndHide('right');
            	}
            });        
        }
    });

    $(window).keydown(function( e ) {
        if ( e.keyCode == 37 ) {
            pdf.prePage();
        } else if (e.keyCode == 39) {
            pdf.prePage();
        }
    });

    $('.zoom-out-btn').click(function(e) {
        pdf.zoomOut();
    });

    $('.zoom-in-btn').click(function(e) {
        pdf.zoomIn();
    });

    $('.zoom-default').click(function(e) {
        pdf.zoomDefault();
    });

});