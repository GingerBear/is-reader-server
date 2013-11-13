// ISReader PDF Reader, Based on pdf.js
// 
// render a page of a pdf file, append hightlights and notes,
// send new notes and notes to server, track reading 
// progress.
// 
// Input: page, notes objects, notes objects
// Author: Neil Ding

/*global define */

define(['./pdf_note', './util'], function (pdf_note) {

    var file_name = ''
    , page = 1
    , book_id = ''
    , pdfData = '' // should read from URL or DOM
    , scale = 2 // Set this to whatever you want. This is basically the "zoom" factor for the PDF.
    , notes = [] // fill hights of current page by server
    , pdf // store pdf file into a locally global variable 
    , selectionPosition
    , base_url = "/"
    , show_mark = true 
    , totalPageNum = 0
    , $containter = undefined;

    // RENDER 


    // load the pdf file the first time loaded.
    function loadPdf(pdfData) {
        //PDFJS.disableWorker = true; //Not using web workers. Not disabling results in an error. This line is
        //missing in the example code for rendering a pdf.
        // console.log("PDF: " + pdfData);
        pdf = PDFJS.getDocument(pdfData);
        pdf.then(function(pdfDoc){
            totalPageNum = pdfDoc.numPages;
        });
        pdf.then(renderPdf);
    }

    // render a page of pdf file, can only used by then(). will be called when goes to a new page
    function renderPdf(pdf) {
        // console.log(page);
        if (page < 1) {
            pdf.getPage(1).then(renderPage);
        } else if (page > totalPageNum) {
            pdf.getPage(totalPageNum).then(renderPage);
        } else {
            pdf.getPage(page).then(renderPage);
        }
    }

    // render each page
    function renderPage(page) {
        var viewport = page.getViewport(scale);
        var $canvas = jQuery("<canvas></canvas>");

        //Set the canvas height and width to the height and width of the viewport
        var canvas = $canvas.get(0);
        var context = canvas.getContext("2d");
        var devicePixelRatio = window.devicePixelRatio || 1;
        canvas.height = viewport.height * devicePixelRatio;
        canvas.width = viewport.width * devicePixelRatio;

        //Append the canvas to the pdf container div
        var $pdfContainer = $containter;
        $pdfContainer.css("height", (canvas.height/devicePixelRatio) + "px").css("width", (canvas.width/devicePixelRatio) + "px");
        $pdfContainer.append($('<div class="reader-notes-div"></div>')).append($canvas);

        //The following few lines of code set up scaling on the context if we are on a HiDPI display
        var outputScale = getOutputScale();

        var canvasOffset = $canvas.offset();
        var $textLayerDiv = jQuery("<div />")
            .addClass("textLayer")
            .css("height", (viewport.height * devicePixelRatio) + "px")
            .css("width", (viewport.width * devicePixelRatio) + "px");
            // .offset({
            //     top: canvasOffset.top,
            //     left: canvasOffset.left
            // });

        if (outputScale.scaled) {
            var cssScale = 'scale(' + (1 / outputScale.sx) + ', ' +
                (1 / outputScale.sy) + ')';
            CustomStyle.setProp('transform', canvas, cssScale);
            CustomStyle.setProp('transformOrigin', canvas, '0% 0%');

            if ($textLayerDiv.get(0)) {
                CustomStyle.setProp('transform', $textLayerDiv.get(0), cssScale);
                CustomStyle.setProp('transformOrigin', $textLayerDiv.get(0), '0% 0%');
            }
        }

        context._scaleX = outputScale.sx;
        context._scaleY = outputScale.sy;
        if (outputScale.scaled) {
            context.scale(outputScale.sx, outputScale.sy);
        }

        $pdfContainer.append($textLayerDiv);

        page.getTextContent().then(function (textContent) {
            var textLayer = new TextLayerBuilder($textLayerDiv.get(0), 0); //The second zero is an index identifying
            //the page. It is set to page.number - 1.
            textLayer.setTextContent(textContent);

            var renderContext = {
                canvasContext: context,
                viewport: viewport,
                textLayer: textLayer
            };

            page.render(renderContext).then(function(){      

                // after page rendered, fill the notes and notes. 
                // Currently by a pre loaded global variable.
                // To fix, a ajax function should be called to get the real highlight and notes data from server.
                if (show_mark) {                        
                    for (var i = notes.length - 1; i >= 0; i--) {
                        pdf_note.renderNote(notes[i].startContainer, notes[i].endContainer, notes[i].startOffset, notes[i].endOffest, notes[i].note, notes[i].is_mark);
                    };
                }
            });
        });
    }

    function refreshPage() {
        $containter.html("");
        $("html, body").animate({ scrollTop: 0 }, 0);
        pdf.then(renderPdf);
        return this;
    }

    function saveProgress() {
        $.ajax({
            type: 'PUT',
            //url: "http://is-reader.herokuapp.com/book/" + book_id,
            url: base_url + 'book/' + book_id,
            data: {last_page: page},
            dataType: 'json',
            success: function(data){
                console.log(data);
            }
        });
    }

    function pageGoto(p) {
        page = p;
        saveProgress();
        $containter.html("");
        $("html, body").animate({ scrollTop: 0 }, 0);
        console.log('load note: %d, %d', book_id, page);
        pdf_note.loadPageNotes(book_id, page, function(data) {
            notes = pdf_note.parseNote(data);
            pdf.then(renderPdf);                
        });    
    }

    function getSelectionObj() {
        if (window.getSelection) {
          selection = window.getSelection();
        } else if (document.selection) {
          selection = document.selection.createRange();
        }
        return selection;
    }

    var hideToolPop = function () {
        $('.tool-pop').slideAndHide('top', undefined, undefined, function() {            
            $('.tool-pop .tools-list').removeClass('hidden');
            $('.tool-pop .note-text-area').addClass('hidden');
        });
    }

    var showToolPop = function (x, y) {
        $('.tool-pop').css({
            'top': y + 'px',
            'left': x + 'px'
        }).slideAndShow('top', undefined, undefined, undefined);
    }

    // bind events like text selection, show tool pop
    var bindEvent = function($containter) {

        $containter.on('mouseup', function(e) {
            var selection = getSelectionObj();
            if (selection != "") {


                console.log("=========== Text Selection Captured ===========");
                console.log("Page: " + page);
                console.log("Starting div index: " + $(selection.getRangeAt(0).startContainer.parentElement).index());
                console.log("Ending div index: " + $(selection.getRangeAt(0).endContainer.parentElement).index());
                console.log("Starting div cursor index: " + selection.getRangeAt(0).startOffset);
                console.log("Ending div cursor index: " + selection.getRangeAt(0).endOffset);

                selectionPosition = $(selection.getRangeAt(0).startContainer.parentElement).index() + 
                ',' + $(selection.getRangeAt(0).endContainer.parentElement).index() + 
                ',' + selection.getRangeAt(0).startOffset + 
                ',' + selection.getRangeAt(0).endOffset;

                // var endEl = $(selection.getRangeAt(0).endContainer.parentElement);

                showToolPop(e.pageX, e.pageY);
            }
        });

        $containter.find('.reader-notes-div').on('mouseup', function(e) {
            e.stopPropagation;
            hideToolPop();
        });

        // remove pop-up
        $(document.body).on('mousedown', function() {
            hideToolPop();
        });

        $containter.find('.textLayer').on('mousedown', function(e) {
            e.stopPropagation();    
            // clear text selection
            if (window.getSelection()) {
                // for non-IE
                window.getSelection().removeAllRanges();
            } else {
                // for IE
                document.selection.empty();
            }
            hideToolPop();
        });


        // prevent remove pop-up when click on pop-up
        $('.tool-pop').on('mousedown click', function(e) {
            e.stopPropagation();    
        });

        $('.tool-pop .tools-list').click(function(e) {
            e.preventDefault();
            var target = $(e.target);
            if (target.is('.hl-btn')) {
                // save first three selected words as mark 
                var s = $(selection.getRangeAt(0).startContainer.parentElement)
                        .text().substring(selection.getRangeAt(0).startOffset);
                var note = s.split(' ').printFirstN(3);
                saveNote(note, true, false, function () {
                    console.log('Mark Saved!');
                    hideToolPop()
                });
            } else if (target.is('.note-btn')) {
                $(this).addClass('hidden');
                var inputAreaDiv = $(this).siblings('.note-text-area');
                inputAreaDiv.removeClass('hidden').find('.note-text').focus();
                // bind save event
                inputAreaDiv.find('.note-save-btn').on('click', function(){
                    var noteText = $(this).parent().parent().find('.note-text').val().trim();
                    var ifPrivate = $(this).parent().parent().find('#if-private').is(":checked");
                    console.log(noteText + ', ' + ifPrivate);
                    saveNote(noteText, false, ifPrivate, function () {
                        console.log('Note Saved!');
                        hideToolPop()
                    });
                });
            } else if (target.is('.share-btn')) {
                // TODO: add sharing feature when fb oauth done.
                alert('share is on building');
            }
        });
    }

    return {

        pageGoto: function(p) {
            pageGoto(p);
        },

        refresh: refreshPage,

        init: function(file_name, last_page, b_id, dom_id) {  
            // init paramaters     
            pdfData = 'data/pdf/' + file_name;
            page = parseInt(last_page);
            book_id = b_id;
            $containter = $(dom_id);

            bindEvent($containter);

            // load pdf
            pdf_note.loadPageNotes(book_id, page, function(data) {
                notes = pdf_note.parseNote(data);
                loadPdf(pdfData);
                pdf_note.loadNoteList(book_id, pageGoto);
            });
        },

        zoomIn: function() {            
            scale += 0.2;
            refreshPage();
        },

        zoomOut: function() {            
            scale -= 0.2;
            refreshPage();
        },

        zoomDefault: function() {       
            scale = 2;
            refreshPage();
        },

        nextPage: function() {
            page = page + 1;
            pageGoto(page);
        },

        prePage: function() {
            page = page - 1;
            pageGoto(page);
        },

        showMark: function() {
            show_mark = true;
            refreshPage();
        },

        hideMark: function() {
            show_mark = false;
            refreshPage();
        }
    }
});
