<?php
$to = "dbtjsrjs8282@naver.com";
$from =  $_POST['fmail'];
$subject = "이름 : ".$_POST['subject']."폰 번호 : ".$_POST['tel'];
$txt =  $_POST['comment'];
$headers = "From: $from";


mail($to,$subject,$txt,$headers);
?>
<script>
	alert("이메일전송완료.\n빠른 시일 내에 답변드리겠습니다!\n감사합니다 :)");
	location.href="nindex.html";
</script>