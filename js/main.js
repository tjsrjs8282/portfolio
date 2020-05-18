		$(function(){
			$(".gooey span").draggable();
		})
		setTimeout(snsForwards ,1000);
		setTimeout(soundForwards ,1100);

		function snsForwards(){
			$(".snsBtnWrap").animate({right:20},400);
		};
		function soundForwards(){
			$(".soundBtnWrap").animate({left:20},400);
		};

		function reset(){
			$("#fullpage").removeClass();
			$("#fullpage").addClass("action");
		};

		$(".toggleMenu").click(function(){
			$(".action").removeClass("snsPlus")
			$(".action").toggleClass("toggle");
		});

		$(".snsBtnWrap").click(function(){
			$(".action").removeClass("toggle")
			$(".action").toggleClass("snsPlus");
		});

		$(".soundBtnWrap").click(function(){
			$(this).toggleClass("active");
		});

		$(".contIcon").click(function(){
			reset();
			$(".action").addClass("contact");
		});

		$(".homeBtn").click(function(){
			const hasHome = $('.action').hasClass('home');
			reset();
			$(".action").addClass("home");
			if(hasHome){alert("현재 Home 입니다.")}
		});

		$(".aboutBtn").click(function(e){
			reset();
			$(".action").addClass("about");
			$(".aboutNav ul li a").removeClass("active");
			$(".aboutNav ul li .aboutBtn").addClass("active");
		});

		$(".skillBtn").click(function(e){
			reset();
			$(".action").addClass("about skill");
			$(".aboutNav ul li a").removeClass("active");
			$(this).addClass("active");
		});

		$(".careerBtn").click(function(e){
			reset();
			$(".action").addClass("about career");
			$(".aboutNav ul li a").removeClass("active");
			$(this).addClass("active");
		});

		$(".workBtn").click(function(e){
			reset();
			$(".action").addClass("work");
		});

		$(".galleryBtn").click(function(){
			reset();
			$(".action").addClass("gallery");
		});

		$(".photoBtn").click(function(){
			reset();
			$(".action").addClass("gallery photo");
		});

		$(".psaiBtn").click(function(){
			reset();
			$(".action").addClass("gallery psai");
		});

		$(".contactBtn").click(function(){
			reset();
			$(".action").addClass("contact");
		});

		
		

		$(".prevBtn").click(function(){
			var workNum = $(".workList > ul > li.active").index();
			var workList = $(".workList > ul > li");
			var spList = $(".workSliderNav > span");
			var txtList = $(".workTxtWrap > div");
			workList.removeClass();
			spList.removeClass();
			txtList.removeClass("active");

			if(workNum >= 0){
				workList.eq(workNum -1).addClass("active");
				spList.eq(workNum -1).addClass("active");
				txtList.eq(workNum -1).addClass("active");
			} else if(workNum == 0){
				workList.eq(workList.length).addClass("active");
				spList.eq(workList.length).addClass("active");
				txtList.eq(workList.length).addClass("active");
			}
		});


		$(".nextBtn").click(function(){
			var workNum = $(".workList > ul > li.active").index();
			var workList = $(".workList > ul > li");
			var spList = $(".workSliderNav > span");
			var txtList = $(".workTxtWrap > div");
			workList.removeClass();
			spList.removeClass();
			txtList.removeClass("active");

			if(workNum < 8){
				workList.eq(workNum +1).addClass("active");
				spList.eq(workNum +1).addClass("active");
				txtList.eq(workNum +1).addClass("active");
			} else if(workNum == 8){
				workList.eq(0).addClass("active");
				spList.eq(0).addClass("active");
				txtList.eq(0).addClass("active");
			}
		});

		$(".workSliderNav > span").click(function(){
			var spNum = $(this).index();
			var workList = $(".workList > ul > li");
			var spList = $(".workSliderNav > span");
			var txtList = $(".workTxtWrap > div");
			workList.removeClass();
			spList.removeClass();
			txtList.removeClass("active");
			workList.eq(spNum).addClass("active");
			spList.eq(spNum).addClass("active");
			txtList.eq(spNum).addClass("active");
		});

		$(".workList > ul > li").click(function(){
			var workNum = $(this).index();
			$(".workBlack").addClass("active");
			$(".workPopupBox > div").eq(workNum).addClass("active");
		});

		$(".workBlack").click(function(e){
			$(this).removeClass("active");
			$(".workPopupBox > div").removeClass("active");
			e.preventdefault();
		});

		$(".workCloseBtn").click(function(e){
			$(".workBlack").removeClass("active");
			$(".workPopupBox > div").removeClass("active");
			e.preventdefault();
		});

        
		window.onmousemove = function (e) {
			var prx = document.getElementById('prx');
	        var prxs = document.getElementById('prxs');
	        var prxss = document.getElementById('prxss');
	        var prxsss = document.getElementById('prxsss');
		    var x = - e.clientX/80,
		        y = - e.clientY/50;
		    prx.style.backgroundPositionX = x + 'px';
		    prx.style.backgroundPositionY = y + 'px';
		    var x2 = - e.clientX/25,
		        y2 = - e.clientY/40;	
		    prxs.style.backgroundPositionX = y2 + 'px';
		    prxs.style.backgroundPositionY = x2 + 'px';
		    var y3 = - e.clientY/20,
		    	xy = - x + y;
		    prxss.style.backgroundPositionX = xy + 'px';
		    prxss.style.backgroundPositionY = y3 + 'px';
		    var x4 = - e.clientX/80,
		        y4 = - e.clientY/100;
		    prxsss.style.backgroundPositionX = x4 + 'px';
		    prxsss.style.backgroundPositionY = y4 + 'px';
		};

		document.querySelector("body").addEventListener('mousemove', eyeball);
		function eyeball(){
		    var eye = document.querySelectorAll(".eye");
		    eye.forEach(function (eye) {
		        let x = (eye.getBoundingClientRect().left) + (eye.clientWidth / 2);
		        let y = (eye.getBoundingClientRect().top) + (eye.clientHeight / 2);
		        let radian = Math.atan2(event.pageX - x, event.pageY - y);
		        let rot = (radian * (180 / Math.PI) * -1)+270;
		        eye.style.transform = "rotate(" + rot + "deg)";
		    });

		}


		if($(window).length) {
			var audio = document.getElementById("audio-player");
		    audio.volume = 0.3;
				$('body').addClass("audio-on");
				if ($('body').hasClass('audio-off')) {
		        	$('body').removeClass('audio-on');
				} 
				$(".soundBtnWrap").on('click', function() {
					$('body').toggleClass("audio-on audio-off");         
						if ($('body').hasClass('audio-off')) {
						audio.pause();
					}

						if ($('body').hasClass('audio-on')) {
						audio.play();
					}
				});
			}

		// $(window).mousemove(function(){

		//  x = event.pageX;
  // 		 y = event.pageY; 
  //  		console.log('x좌표:' + x + ', y좌표:' + y);
		// });