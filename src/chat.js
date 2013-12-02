(function() {
  var lastID = 1;
  var chatTimerDelayUpper = 9000;
  var chatTimerDelayLower = 2000;
  var chatTimerDelay = 5000;

  var skipNextGetChat = false;

  var chatBuffer = new Array();

  getChatTimer();
  function getChatTimer() {
    setTimeout(getChatTimer, chatTimerDelay);
    if (chatTimerDelay < chatTimerDelayUpper) {chatTimerDelay += 150;}
    if (skipNextGetChat) {
      skipNextGetChat = false;
      return;
    }
    getChat();
  }

  var firstGetChat = true;
  function getChatDone(data) {
    var items = [];
    var p; //our prep string
    var newChats = false;

    var lastDisplay = '';
    var lastMessage = '';

    if (data.length < 3 || data == 'false') {return;}

    json = jQuery.parseJSON(data);

    $.each(json, function(key, chat) {

      var postDate = new Date();
      postDate.setTime(postDate.getTime() + chat.secondsSince * 1000);
      var timestamp = postDate.format("ddd h:MM:ss TT");

      if (!chat.message) return;

      var strClass = '';
      if (chat.userID == userObj.ID) {
        strClass += ' self';
      }
      if (chat.userID == '-1') {
        strClass += ' server';
        chat.displayName = 'SERVER'
      }

      var usernameClass = '';
      if (chat.message.indexOf("/me ") == 0) {
        chat.message = chat.message.substring(4);
        usernameClass = ' me';
      }

      var isSpoiler = false;
      if (chat.message.indexOf("/spoiler ") == 0) {
        chat.message = chat.message.substring(9);
        isSpoiler = true;
      }

      if (!isSpoiler) {
        document.title = chat.displayName+': '+chat.message.substring(0, 20)+' | Pathery Chat';
      } else {
        document.title = chat.displayName+': ~Spoiler~ | Pathery Chat';
      }

      //console.log("INSIDE BUILD START");
      p = "<div  title='"+ timestamp+"'>";
      p = p+ " <div class='chatColumn1'>";
      p = p+ "    <div class='grid_td chatBadge' style='float:left; width:35px; height:35px; background:"+chat.wallColor+" url("+linkEmblem(chat.wallEmblem, chat.wallOrientation)+");'>";
      p = p+ "        <div style='background-color:transparent;' class='grid_td_inner grid_td_rocks'>";
      p = p+ "        </div>";
      p = p+ "    </div>";
      p = p+ " </div>";

      p = p+ " <div class='chatColumn2'>";
      if (chat.userID == '-1') {
        p = p+ "<span class='chatUsername"+usernameClass+"'><a href='home'>";
      } else {
        p = p+ "<span class='chatUsername"+usernameClass+"'><a href='achievements?id="+chat.userID+"' style='color:"+chat.displayColor+"'>";
      }
      p = p+ chat.displayName+"</a></span>";

      if (isSpoiler == true) p = p+ " <span class='chatText spoiler'>";
      else p = p+ "   <span class='chatText'>";
      p = p+ chatReplaceAndEncode(chat.message);
      p = p+ "    </span>";
      p = p+ "    </div>";
      p = p+ "</div>";

      //Message is legitmently new or a server message?
      if (chat.ID > lastID || typeof(chat.ID) == 'undefined') {
        items.push('<div class="chatMessage'+strClass+'" id="C_' + chat.ID + '">' + p + '</div>');
        newChats = true;
      }
      lastDisplay = chat.displayName
      lastMessage = chat.message
      if (chat.ID > 0) lastID = chat.ID;
    });

    //console.log("BUILD DONE");

    if (newChats) {
      if (chatTimerDelay > chatTimerDelayLower)   chatTimerDelay -= 1000;

      var elem = $("#chatContainer");
      var atBottom = (elem.scrollTop() >= elem[0].scrollHeight - elem.outerHeight() - 1);

      $("#chatContainer").append(items.join(''));

      if (atBottom || firstGetChat) {
        $("#chatContainer").scrollTop($("#chatContainer")[0].scrollHeight);
        firstGetChat = false;
      }
    }

    $('.spoiler').unbind();
    $('.spoiler').click(function() {
      $(this).removeClass("spoiler");
    });

  }

  function chatReplaceAndEncode(chat) {
    chat = (chat ?  jQuery('<div />').text(chat).html() : '')
    chat = chat.replace(/\*\*(\S(.*?\S)?)\*\*/gm, "<b>$1</b>");
    chat = chat.replace(/\~\~(\S(.*?\S)?)\~\~/gm, "<s>$1</s>");
    chat = chat.replace(/\*(\S(.*?\S)?)\*/gm, "<i>$1</i>");

    //Surround all URLs with a <a> link
    var URLexp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    chat = chat.replace(URLexp, "<a href='redirect?to=$1' target='_blank'>$1</a>");

    //Replace # in the URL with %23
    chat = chat.replace(/<a href='redirect\?to=(.*?)(#)(.*?)' target='_blank'>/ig, "<a href='redirect?to=$1%23$3' target='_blank'>");
    chat = chat.replace(/<a href='redirect\?to=(.*?)(&amp;)(.*?)' target='_blank'>/ig, "<a href='redirect?to=$1%26$3' target='_blank'>");
    //Making the bet that not all browsers do the same:
    chat = chat.replace(/<a href='redirect\?to=(.*?)(&)(.*?)' target='_blank'>/ig, "<a href='redirect?to=$1%26$3' target='_blank'>");

    return chat;
  }

  function prepChat(chat) { return chat.join('|:|').replace(/\&/g,'%26').replace(/\+/g,'%2B') }

  var chatIsBusy = false;
  function getChat(message) {
    var dataString = 'getChatFromID='+lastID;
    var backup = new Array();

    var fncComplete = '';
    if (!chatIsBusy && chatBuffer.length > 0) {
      chatIsBusy = true;
      dataString += '&send=true&messages='+prepChat(chatBuffer);
      backup = chatBuffer.slice(0);
      chatBuffer.length = 0;
      fncComplete = function() {chatIsBusy = false;};
    }
    $.ajax({
      type: "POST",
      url: "http://www.pathery.com/ajax/chat.ajax.php",
      data: dataString,
      error: function() {
        chatBuffer = backup.concat(chatBuffer);
      },
      success: getChatDone,
      complete: fncComplete
    });
  }

  function sendChat() {
    var message = $("input#message").val().replace("|:|", "||");
    if (message == '') return false;
    chatBuffer.push(message);
    $("input#message").val('');
    if (skipNextGetChat == false) { skipNextGetChat = true; }
    getChat();
    return false;
  }

  function scrollBottom() {
    $('#chatContainer')[0].scrollTop = $('#chatContainer')[0].scrollHeight
  }

  $(document).ready(function() {
      $('#sendChat').live("submit", function() { sendChat() });
      scrollBottom();
  });



})()

