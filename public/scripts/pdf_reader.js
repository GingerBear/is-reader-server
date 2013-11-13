/*global define */
define(['./pdf_render', './pdf_panel', './util'], function (pdf, panel, util) {
    //'use strict';

	var showPdf = function(data){
		if (data) {
			$('title').html(data.title + ' - IS Reader');
			$('.title').html(data.title);
			pdf.init(data.file_name, data.last_page, data._id, '#pdfContainer');
			$('.show-mark-check').change(function(){
				if ($(this).is(':checked')) {
					pdf.showMark();
				} else {
					pdf.hideMark();
				}
			});
		}
	};

	var load = function () {		
		var book_id = util.getURLParameter('id');
		$.ajax({
			type: 'GET',
			url: "/book/" + book_id,
			dataType: 'json',
			success: showPdf
		});
	};

	return {
		load: load
	};
});