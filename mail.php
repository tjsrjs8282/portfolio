<?php
$to = "dbtjsrjs8282@naver.com";
$from =  $_POST['fmail'];
$subject = "�̸� : ".$_POST['subject']."�� ��ȣ : ".$_POST['tel'];
$txt =  $_POST['comment'];
$headers = "From: $from";


mail($to,$subject,$txt,$headers);
?>
<script>
	alert("�̸������ۿϷ�.\n���� ���� ���� �亯�帮�ڽ��ϴ�!\n�����մϴ� :)");
	location.href="nindex.html";
</script>