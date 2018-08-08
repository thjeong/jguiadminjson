var repo = 'mct/keyword_to_mct_ry';
var ref_code = {};

var add_card = function(title, contents, where = 'append') {
    var new_card = $('div.empty-card-col').clone();
    new_card.removeClass('empty-card-col').show();
    new_card.find('.empty-card').removeClass('empty-card').addClass('card');
    new_card.find('.card-header > .card-header-title').text(title);

    for(var item in contents) {
        var new_slot = new_card.find('li.empty-item').clone();
        new_slot.removeClass('empty-item').show();
        new_slot.text(item + ' : ' + contents[item]);
        new_slot.data('key', item);
        new_slot.data('value', contents[item]);
        new_card.find('ul.list-group').append(new_slot);
    }

    if(where == 'prepend') {
        $('#item-deck').prepend(new_card);
    } else {
        $('#item-deck').append(new_card);
    }
    return new_card;
}

var renew_version_dropdown_navbar = function(select) {
  console.log('renew_version_dropdown: ', select);
  $('#version-dropdown .dropdown-item:not(empty-item)').each(function() {
    $(this).remove();
  });

  $.ajax({
    url: './json/' + repo.split('/')[0],
    dataType: 'json',
    success: function(data) {
      var versions = data['versions'];
      console.log('versions:', versions);
      versions.sort(function(a, b){return b-a});
      select = select == 'current' ? versions[0] : undefined;
      console.log('select : ', select);
      for(var idx in versions) {
        var new_item = $('a.empty-dropdown-item').clone();
        new_item.removeClass('empty-dropdown-item').addClass('dropdown-item').show();
        if(idx == 0) {
            new_item.text(versions[idx] + ' (current)');
        } else {
            new_item.text(versions[idx] + ' (old)');
        }
        new_item.data('value', versions[idx]);
//        console.log(new_item);
        $('#version-dropdown').append(new_item);
      }
      if(select) {
          $('a.dropdown-item').each(function() {
            if($(this).data('value') == select) {
              $(this).click();
            }
          });
      }
    }
  });
}

// Add new item into the card
$(document).on('click', '.card-header .card-add-item', function() {
    console.log('prepare input form for new item');
    if($('.input-active').length > 0) {
        console.log('clicked on item to edit : already in edit mode');
        return;
    }

    var this_card = $(this).closest('.card');

    var new_slot = this_card.find('li.empty-item').clone();
    new_slot.addClass('on-editing').removeClass('empty-item');
    this_card.find('ul.list-group').prepend(new_slot);

    var item_input = $('li.empty-input').clone().addClass('input-active').show();
    this_card.find('ul.list-group').prepend(item_input);
});

// Set data tag on list-group-item from input form typing : key in json
$(document).on('keyup', 'li.list-group-item.input-active input.key', function() {
    console.log('keyup', $(this).val(), ref_code[$(this).val()]);
    $(this).closest('li.list-group-item').data('key', $(this).val());
    if(ref_code[$(this).val()]) {
        console.log('found:', ref_code[$(this).val()]);
        $(this).closest('li.list-group-item.input-active').find('input.value').attr('value', ref_code[$(this).val()]);
        $(this).closest('li.list-group-item.input-active').data('value', ref_code[$(this).val()]);
    } else {
        $(this).closest('li.list-group-item.input-active').find('input.value').attr('value', '');
        $(this).closest('li.list-group-item.input-active').removeData('value');
    }
});

// Set data tag on list-group-item from input form typing : value in json
$(document).on('keyup', 'li.list-group-item.input-active input.value', function() {
    $(this).closest('li.list-group-item').data('value', $(this).val());
});

$(document).on('click', 'li.list-group-item .delete', function(e) {
    var item_to_delete = $(this).closest('li.list-group-item');
    var sibling = item_to_delete.siblings('.on-editing');
    console.log('delete:', item_to_delete, sibling);
    sibling.remove();
    item_to_delete.remove();
    e.stopPropagation();
});

// Put the item in editing mode
$(document).on('click', 'li.list-group-item:not(.input-active)', function(e) {
    if($('.input-active').length > 0) {
        console.log('clicked on item to edit : already in edit mode');
        return;
    }
    var item_input = $('li.empty-input').clone().addClass('input-active').show();

    item_input.data('key', $(this).data('key'));
    item_input.data('value', $(this).data('value'));
    item_input.find('input.key').val($(this).data('key'));
    item_input.find('input.value').val($(this).data('value'))

    $(this).addClass('on-editing').hide();
    $(this).after(item_input);
    e.stopPropagation();
});

// Cancel the active operation : when it's clicked out of input area
$('div#item-deck').click(function(e) {
    console.log('click:', $(e.target).parents('.input-active'));
    if($(e.target).parents('.input-active').length == 0) {
        console.log("html.click : clicked activated input");
        var input_active = $('li.input-active');

        if(input_active.data('key') && input_active.data('value')) {
            console.log('closing active-input: ', [input_active.data('key'), input_active.data('value')]);
            $('.input-active').siblings('.on-editing').each(function() {
                $(this).data('key', input_active.data('key'));
                $(this).data('value', input_active.data('value'));
                $(this).text(input_active.data('key') + ' : ' + input_active.data('value'));
                $(this).removeClass('on-editing');
                $(this).show();
            })
            $('.input-active').remove();
        }
    }
});

$(document).on('click', '.dropdown-menu .dropdown-item', function(){
  console.log('clicked on version:', $(this).data('value'))
  $(this).parents(".dropdown").find('.dropdown-toggle').text($(this).text());
  $(this).parents(".dropdown").find('.dropdown-toggle').val($(this).text());
  $(this).parents(".dropdown").find('.dropdown-toggle').data('version', $(this).data('value'));
});

$('li.nav-item.dropdown').on('show.bs.dropdown', function() {
  console.log('dropdown clicked : loading filelist');
  renew_version_dropdown_navbar();
})

$('#reload').click(function() {
    var version_to_load = $('#navbarDropdown').data('version');
    console.log('clicked on load: ', version_to_load);
    $('#item-deck').empty();
    ref_code = {};
    $.ajax({
        url: './json/' + repo + '/' + version_to_load,
        dataType: 'json',
        success: function(data) {
            // sort by key
            var keys = Object.keys(data)
            keys.sort(function(a,b) {if(a>b) return 1; else return -1;});
            console.log(keys)
            keys.forEach(name => {
            console.log('key:', name)
                var items = data[name];
                add_card(name, items, 'append');
                for(var key in items) {
                    // renew ref_code:
                    ref_code[key] = items[key];
                }
            })
        }
    });
});

$('button#search').click(function() {
    console.log('searching...');
});

// Modal
$('#createModal').on('show.bs.modal', function (e) {
  // Reset the text input box
  $('#inputCardName').val('');
})

$('#saveModal').on('shown.bs.modal', function (e) {
  // reset
  $('#jsonSave').attr('disabled', false);
  $('#saveModal .modal-body p').text('Are you sure to save data & deploy json file into the server?');
  // data validation
  var on_editing = $('.on-editing');
  console.log('on_editing.length', on_editing.length);
  if(on_editing.length > 0) {
    $('#saveModal .modal-body p').text("Some items are still on edit. Please complete the editing process.");
    $('#jsonSave').attr('disabled', true);
  }
})

$('#modelSave').click(function() {
//    console.log('name to save: ', $('#inputCardName').val());
    add_card($('#inputCardName').val(), {}, 'prepend').find('.card-header .card-add-item').click();

    $('#createModal').modal('hide');
})

$('#jsonSave').click(function() {
    var objToSave = {};
    var cards = $('.card');
    cards.each(function() {
        var title = $(this).find('.card-header-title').text();
        var obj = {}
        var items = $(this).find('.list-group-item:not(.empty-item)');
        items.each(function() {
            obj[$(this).data('key')] = $(this).data('value');
        })
        objToSave[title] = obj;
    })
    console.log('obj to save:', objToSave);
    $.ajax({
        type: 'POST',
        dataType: "json",
        contentType: 'application/json',
        url: './json/' + repo,
        data: JSON.stringify(objToSave),
        success: function(data) {
            console.log('save result:', data);
        }
    })
    $('#saveModal').modal('hide');
})

//renew_version_in_navbar();