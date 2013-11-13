define(['./util'], function (util) {    

    var loadPageNotes = function(book_id, page, fn) {
        $.ajax({
            type: 'GET',
            url: 'book/' + book_id + "/" + page,
            dataType: 'json',
            success: function(data){
                // console.log("notes: " + 'book/' + book_id + "/" + page);
                notes = [];
                parseNote(data);
                // console.log(notes);
                if (fn) fn(data);
            }
        });
        return this;
    };

    var parseNote = function(data) {
    	var notes = [];
        for (var i = data.length - 1; i >= 0; i--) {
            var pos = data[i].position.split(',');;
            notes.push({
                note : data[i].note, 
                is_mark : data[i].is_mark, 
                startContainer : pos[0], 
                endContainer : pos[1], 
                startOffset : pos[2], 
                endOffest : pos[3]
            });
        };
        return notes;
    };

    var deleteNote = function (id ,fn) {
        $.ajax({
            type: 'DELETE',
            url: "note",
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

    var attachNoteOnPdf = function(text, relativeEl) {
        var html = '<div class="note-div">'
                 + '<p class="note-text hidden">'+text+'</p>'
                 + '<span class="btn-show-note-text glyphicon glyphicon-comment"></span>'
                 + '</div>';
        $(html)
        .appendTo($('.reader-notes-div'))
        .css({
            top: relativeEl.offset().top
        })
        .find('.btn-show-note-text') // dom dynamically append, so not coupled with jade
        .on('click', function(){
            var text = $(this).siblings('.note-text');
            if (text.is('.hidden'))
                text.slideAndShow('bottom');
            else
                text.slideAndHide('bottom');
        });
        console.log(text+" rendered");
    }

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
        return function (startContainer, endContainer, startOffset, endOffest, note, is_mark) {
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
            if (!is_mark) 
                attachNoteOnPdf(note, _getEleByIndex(startContainer));
        }
    })();

    var renderNoteList = function(data, pageGoto) {
    	// console.log(data);
        data.sort(function(a,b){
            return a.page > b.page ? 1 : -1;
        });
        if (data.length > 0) {
            for (var i = data.length - 1; i >= 0; i--) {
                $('.note-list').append($('<li data-id="'+data[i]._id+'"><b>'+data[i].page+'</b>'
	                + '<span class="del-note-btn"><span class="glyphicon '
	                + 'glyphicon-remove-circle"></span></span><p class="note-text-p">'
	                + (data[i].is_mark ? '<span class="mark-quote">"' : '')
	                + (data[i].note || '[no note]')
	                + (data[i].is_mark ? '"</span>' : '') + '</p></li>'));
            };
        }else{
            $('.note-list').append($('<li>No Notes</li>'))
        }
        $('.note-list').children('li').on('click', function(e) {
            var page = parseInt($(this).children('b').text());
            // after get page, go to that page
            if (pageGoto) pageGoto(page);
        });
        $('.close-list-div').on('click', function(){
            $(this).parent().parent().slideAndHide('right');
        });
        $('.del-note-btn').on('click', function(e){
        	e.stopPropagation();
            var id = $(this).parent().data('id');
            // bind slide up with the parent <li>
            deleteNote(id, $.proxy(function(){
                $(this).slideUp(100, function(){
                    $(this).remove();
                });
            }, $(this).parent()));
        });
    }

    var loadNoteList = function(book_id, fn) {
        $('.note-list').html('');
        $.ajax({
            type: 'GET',
            url: 'note_list/' + book_id,
            dataType: 'json',
            success: function(data) {
            	renderNoteList(data, fn);
            }
        });
        return this;
    }

    var saveNote = function (note, ifMark, ifPrivate, fn) {
        $.ajax({
            type: 'POST',
            url: "note",
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
                if (!ifMark)
                    renderNote(pos[0], pos[1], pos[2], pos[3], note)
                if (fn) fn();
            }
        });
    };

    return {
    	init: function() {

    	},

    	loadPageNotes: loadPageNotes,
    	loadNoteList: loadNoteList,
    	renderNote: renderNote,
        saveNote: saveNote,
        deleteNote: deleteNote,
        parseNote: parseNote,

        showNote: function(fn) {
            show_mark = true;
            if (fn) fn();
        },

        hideNote: function(fn) {
            show_mark = false;
            if (fn) fn();
        }
    }

});