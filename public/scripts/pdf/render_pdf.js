// ISReader PDF Reader, Based on pdf.js
// 
// render a page of a pdf file, append hightlights and notes,
// send new notes and notes to server, track reading 
// progress.
// 
// Input: page, notes objects, notes objects
// Author: Neil Ding

var LoadPage = function () {
    var args = Array.prototype.slice.call(arguments, 0)
    , file_name = args.shift()
    , page = parseInt(args.shift())
    , book_id = args.shift()
    , pdfData = 'data/pdf/' + file_name // should read from URL or DOM
    , scale = 2 // Set this to whatever you want. This is basically the "zoom" factor for the PDF.
    , notes = [] // fill hights of current page by server
    , pdf // store pdf file into a locally global variable 
    , selectionPosition
    , base_url = "/"
    , totalPageNum = 0;
    //, base_url = "http://localhost:3000/";

    // RENDER 


    // load the pdf file the first time loaded.
    function loadPdf(pdfData) {
        //PDFJS.disableWorker = true; //Not using web workers. Not disabling results in an error. This line is
        //missing in the example code for rendering a pdf.
        pdf = PDFJS.getDocument(pdfData);
        pdf.then(function(pdfDoc){
            totalPageNum = pdfDoc.numPages;
        });
        pdf.then(renderPdf);
    }

    // render a page of pdf file, can only used by then(). will be called when goes to a new page
    function renderPdf(pdf) {
        console.log(page);
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
        var $pdfContainer = jQuery("#pdfContainer");
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

                for (var i = notes.length - 1; i >= 0; i--) {
                    renderNote(notes[i].startContainer, notes[i].endContainer, notes[i].startOffset, notes[i].endOffest, notes[i].note);
                };

            });
        });
    }

    function refreshPage() {
        $("#pdfContainer").html("");
        $("html, body").animate({ scrollTop: 0 }, 0);
        pdf.then(renderPdf);     
        return this;
    }

    function saveProgress(page) {
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
        saveProgress(page);
        $("#pdfContainer").html("");
        $("html, body").animate({ scrollTop: 0 }, 0);
        loadNotes(page, function() {
            pdf.then(renderPdf);                
        });    
    }

    function hideToolPop() {
        $('.tool-pop').animate({
            top: "-=10",
            opacity: 0
        }, 100, function() {
            $(this).addClass('hidden');
            $('.tool-pop .tools-list').removeClass('hidden');
            $('.tool-pop .note-text-area').addClass('hidden');
        });
    }

    function showToolPop(x, y) {
        $('.tool-pop').removeClass('hidden').css({
            'top': y + 'px',
            'left': x + 'px',
            opacity: 0
        }).animate({
            top: "+=10",
            opacity: 1
        }, 100);
    }

    function getSelectionObj() {
        if (window.getSelection) {
          selection = window.getSelection();
        } else if (document.selection) {
          selection = document.selection.createRange();
        }
        // console.log(selection.getRangeAt(0));
        // console.log(selection.getRangeAt(0).endContainer.parentElement);
        // console.log($(selection.getRangeAt(0).startContainer.parentElement).index());
        // console.log($(selection.getRangeAt(0).endContainer.parentElement).index());
        // console.log(selection.getRangeAt(0).startOffset);
        // console.log(selection.getRangeAt(0).endOffset);
        return selection;
    }

    var parseNote = function(data) {
        for (var i = data.length - 1; i >= 0; i--) {
            var pos = data[i].position.split(',');;
            notes.push({
                note : data[i].note, 
                startContainer : pos[0], 
                endContainer : pos[1], 
                startOffset : pos[2], 
                endOffest : pos[3]
            });
        };
    };

    var loadNotes = function(page, fn) {
        $.ajax({
            type: 'GET',
            url: base_url + 'book/' + book_id + "/" + page,
            dataType: 'json',
            success: function(data){
                console.log("notes: " + base_url + 'book/' + book_id + "/" + page);
                notes = [];
                parseNote(data);
                console.log(notes);
                if (fn) fn(data);
            }
        });
        return this;
    };

    var renderNote = (function () {
        var _commonContainer = ".textLayer";
        var _getEleByIndex = function (container) {
            return $(_commonContainer + ' div:eq(' + container + ')')
        }
        var _wrapByOffset = function ($el, from, to, wrapperTag) {
            var len = $el.html().length || 0;
            from = from || 0;
            to = to || len;
            // console.log(from); 
            // console.log(to); 
            $el.html($el.html().substring(0, from) + "<span class='hl-text'>" + $el.html().substring(from, to) + "</span>" + $el.html().substring(to));
        }
        return function (startContainer, endContainer, startOffset, endOffest, note) {
            console.log(startContainer + ' |' + endContainer + ' |' + startOffset + ' |' + endOffest);
            // render underscore of the note
            if (startContainer === endContainer) {
                _wrapByOffset(_getEleByIndex(startContainer), startOffset, endOffest);
            }else{                
                _wrapByOffset(_getEleByIndex(startContainer), startOffset, undefined);
                _wrapByOffset(_getEleByIndex(endContainer), undefined, endOffest);
                for (var i = parseInt(startContainer) + 1; i < parseInt(endContainer); i++) {
                    console.log(i);
                    _wrapByOffset(_getEleByIndex(i), undefined, undefined);
                };
            }
            // render text of the note
            if (note) appendNoteText(note, _getEleByIndex(startContainer));
        }
    })();

    var appendNoteText = function(text, relativeEl) {
        var html = '<div class="note-div"><button class="btn btn-xs btn-default btn-show-note-text">'
                 + '<span class="glyphicon glyphicon-comment"></span>'
                 + '</button><p class="note-text hidden">'+text+'</p>'
                 + '</div>';
        $(html)
        .appendTo($('.reader-notes-div'))
        .css({
            top: relativeEl.offset().top
        })
        .find('.btn-show-note-text')
        .on('click', function(){
            var text = $(this).siblings('.note-text');
            if (text.is('.hidden'))
                text.removeClass('hidden');
            else
                text.addClass('hidden');
        });
        console.log(text+" rendered");
    }

    var saveNote = function (note, ifMark, ifPrivate, fn) {
        $.ajax({
            type: 'POST',
            url: base_url + "note",
            data: {
                book_id: book_id,
                page: page,
                position: selectionPosition, // global variable 
                is_mark: ifMark,
                is_private: ifPrivate,
                note: note || ''
            },
            dataType: 'json',
            success: function(data){
                fetchNoteList();
                var pos = selectionPosition.split(',');
                renderNote(pos[0], pos[1], pos[2], pos[3], note)
                if (fn) fn();
            }
        });
    };

    var deleteNote = function (id ,fn) {
        $.ajax({
            type: 'DELETE',
            url: base_url + "note",
            data: {
                note_id: id
            },
            dataType: 'json',
            success: function(data){
                if (data.success) {
                    if (fn) fn();
                }else{
                    console.log('Something wrong: Cannot Delete Note.');
                }
            }
        });
    }

    var fetchNoteList = function(fn) {
        $('.note-list').html('');
        $.ajax({
            type: 'GET',
            url: base_url + 'note_list/' + book_id,
            dataType: 'json',
            success: function(data){
                // sort by page
                console.log(data);
                data.sort(function(a,b){
                    return a.page > b.page ? 1 : -1;
                });
                if (data.length > 0) {
                    for (var i = data.length - 1; i >= 0; i--) {
                        $('.note-list').append($('<li data-id="'+data[i]._id+'"><b>'+data[i].page+'</b>'
                        + '<span class="del-note-btn"><span class="glyphicon '
                        + 'glyphicon-remove-circle"></span></span><p class="note-text-p">'
                        + (data[i].note || '[Mark]')+'</p></li>'));
                    };
                }else{
                    $('.note-list').append($('<li>No Notes</li>'))
                }
                $('.note-list').on('click', function(e) {
                    var target = $(e.target);
                    if (target.is('.note-text-p')) {
                        var page = parseInt(target.siblings('b').text());
                        pageGoto(page);
                    }
                });
                $('.close-note-list-div').on('click', function(){
                    $('.note-list-div').animate({
                        right: "-=10",
                        opacity: 0.5
                    }, 100, function(){
                        $(this).addClass('hidden');
                    });
                });
                $('.del-note-btn').on('click', function(){
                    var id = $(this).parent().data('id');
                    console.log(id);
                    deleteNote(id, $.proxy(function(){
                        $(this).slideUp(100, function(){
                            $(this).remove();
                        });
                    }, $(this).parent()));
                });
                if (fn) fn(data);
            }
        });
        return this;
    }

    // use event delegation

    $('.nav-btn-div').on('click', function(e){
        var target = $(e.target);
        if (target.is('.next-page') || target.is('.next-page span')){
            page = page + 1;
            pageGoto(page);
        } else if (target.is('.pre-page') || target.is('.pre-page span')) {
            page = page - 1;
            pageGoto(page);
        }
    });

    $('.panel-tool-div').on('click', function(e){
        var target = $(e.target);
        if (target.is('.menu-btn')){
            page = page + 1;
            pageGoto(page);
        } else if (target.is('.notes-list-btn') || target.is('.notes-list-btn span')) {
            console.log('Show note list');
            if ($('.note-list-div').is('.hidden')){
                $('.note-list-div').removeClass('hidden').animate({
                    right: "+=10",
                    opacity: 1
                }, 100);
            } else {
                $('.note-list-div').animate({
                    right: "-=10",
                    opacity: 0.5
                }, 100, function(){
                    $(this).addClass('hidden');
                });
            }
            
        }
    });

    $(window).keydown(function( e ) {
        if ( e.keyCode == 37 ) {
            e.preventDefault();
            $('.pre-page').click();
        } else if (e.keyCode == 39) {
            e.preventDefault();
            $('.next-page').click();
        }
    });

    $('#pdfContainer').on('mouseup', function(e) {
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

    $('#pdfContainer .reader-notes-div').on('mouseup', function(e) {
        e.stopPropagation;
        hideToolPop();
    });

    // remove pop-up
    $(document.body).on('mousedown', function() {
        hideToolPop();
    });

    $('#pdfContainer .textLayer').on('mousedown', function(e) {
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
            saveNote('', true, false, function () {
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
            alert('share is building');
        }
    });

    return {

        pageGoto: function(p) {
            pageGoto(p);
        },

        refresh: function() {
            refreshPage();
        },

        init: function() {            
            loadNotes(page, function() {
                loadPdf(pdfData);   
                fetchNoteList();         
            });    
        }
    }

};
