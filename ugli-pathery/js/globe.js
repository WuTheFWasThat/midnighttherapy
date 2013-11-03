function showSignin() {
	if (document.getElementById('oid_hidden') !== undefined) {
		document.getElementById('oid_hidden').id = 'oid_wrapper';
	}
}
function hideSignin() {
	if (document.getElementById('oid_wrapper') !== undefined) {
		document.getElementById('oid_wrapper').id = 'oid_hidden';
	}
}

function createSignin() {
	var div = document.createElement('div');
	var content = '<div class="wrapper" id="oid_hidden" >';
	content += '	<h2>Sign in</h2>';
	content += '	<div id="oid_box">';
	content += '		<h2 style="color:#333;">Do you have an account here?</h2>';
	content += '		<a rel="nofollow" href="login?op=google"><img id="oid_btn" src="images/btns/signin_Google.png" alt="Sign in with Google" /></a>';
	content += '		<a rel="nofollow" href="login?op=yahoo"><img id="oid_btn" src="images/btns/signin_Yahoo.png" alt="Sign in with Yahoo" /></a>';
	content += '		<a id="oid_learn" href="http://openid.net/get-an-openid/what-is-openid/"  target="_blank" >Learn more about OpenID</a>';
	content += '		<a id="oid_cancel" href="javascript:hideSignin();">X</a>';
	content += '	</div>';
	content += '</div>';
	div.innerHTML = content;
	document.body.appendChild(div.firstChild);
}

//Make unselectable elements unselectable (hack for IE 9.0 and below, which doesn't support our CSS)
$(document).ready(function()
{
	if ($.browser.msie && $.browser.version < 10) 
	{
		$('.unselectable').find(':not(input)').attr('unselectable', 'on');
	}
});