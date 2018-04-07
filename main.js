$( document ).ready(function() {
	var edit_mode=false;
	var countUp=true;
	var timerInt=false;
	var startTime=false;
	var elapsedTime=0;
	var countUntil=0;
	var countDirection='up';
	var clock=$('.top-bar .clock');
	$('#add-racer').click(function(){
		setupRacerPopup(null);
	});
	$('#options').click(function(){
		$.magnificPopup.open({
			items: {
				src:$('.options-popup')
			},		
			removalDelay: 300,
			mainClass: 'mfp-fade'
		});
	});
	$('#edit-racers').click(function(){
		if(!edit_mode)
		{
			edit_mode=clock.html();
			clock.html('Edit Racers');
			$(this).html('<i class="fas fa-check"></i>');
		}
		else
		{
			clock.html(edit_mode);
			edit_mode=false;
			$(this).html('<i class="fas fa-edit"></i>');
		}
	});
	$('#start-race').click(function(){
		if(!timerInt)
		{
			var minutes_setting=parseInt($('.options-popup input.minutes').val()) || 0;
			if(minutes_setting>0 && countDirection=='down')
			{
				countUntil=1000*60*minutes_setting;
			}
			timerInt=setInterval(updateClock,10);
			startTime = Date.now()-elapsedTime;
			if("vibrate" in window.navigator)
			{
			   navigator.vibrate([200]);
			}
		}
		else
		{
			clearInterval(timerInt);
			timerInt=false;
			if("vibrate" in window.navigator)
			{
			   navigator.vibrate([200, 30, 200]);
			}
		}
	});
	$('#full-screen').click(toggleFullScreen);

	$('.options-popup .reset-time').click(function(){
		resetClock();
		$.magnificPopup.close();
	});
	$('.options-popup .clear-laps').click(function(){
		if(!confirm('Clear all lap times?'))
			return;
		$('.racers-grid .racer').each(function(){
			var setup=$(this).data('setup');
			setup.bestTime=false;
			setup.lastTime=false;
			setup.last_elapsed=false;
			setup.laps=false;
			updateRacer($(this), setup);
		});
		updateRacerStorage();
		$.magnificPopup.close();
	});
	$('.options-popup .delete-all').click(function(){
		if(!confirm('Delete all racers?'))
			return;
		$('.racers-grid .racer').remove();
		updateRacerStorage();
		$.magnificPopup.close();
	});
	$('.options-popup .close-options').click(function(){
		$.magnificPopup.close();
	});

	$('.options-popup input.minutes').change(function(){		
		updateOptionsStorage();
		resetClock();
	});
	$('.options-popup input[name="counter-mode"]').change(function(){
		if($(this).val()=="down")
			$('.counter-mode.down').slideDown();
		else
			$('.counter-mode.down').slideUp();
		
		updateOptionsStorage();
		resetClock();
	});
	
	function updateClock()
	{
		elapsedTime = Date.now() - startTime;
		var time=elapsedTime;
		if(countDirection=="down" && countUntil!=0)
			time=countUntil-elapsedTime;
		if(time<=0)
		{
			time=0;
			clearInterval(timerInt);
			timerInt=false;
			if("vibrate" in window.navigator)
			{
			   navigator.vibrate([200, 30, 200]);
			}
		}
		var minutes = Math.floor(time / 60000);
  		var seconds = Math.floor(((time % 60000) / 1000));
  		var millis = Math.floor(((time % 1000) / 10));
		clock.html((minutes < 10 ? '0' : '') + minutes + ":" + (seconds < 10 ? '0' : '') + seconds + ":" + (millis < 10 ? '0' : '') + millis);
	}
	function resetClock()
	{
		if(timerInt)
		{
			clearInterval(timerInt);
			timerInt=false;
		}
		elapsedTime=0;
		startTime=false;

		var minutes_setting=parseInt($('.options-popup input.minutes').val()) || 0;
		if(minutes_setting>0 && countDirection=='down')
			clock.html((minutes_setting < 10 ? '0' : '') + minutes_setting + ':00:00');
		else
			clock.html('--:--:--');
	}

	function setupRacerPopup(racer)
	{
		var popup=$('.add-racer-popup').clone().removeClass('mfp-hide');
		$.magnificPopup.open({
			items: {
				src:popup
			},		
			removalDelay: 300,
			mainClass: 'mfp-fade'
		});
		$('.colors .color', popup).click(function(){
			$(this).parent().find('.color').removeClass('active');
			$(this).addClass('active');
		});
		$('.name, .color',popup).click(function(){
			$('.errors', popup).html("");
		});		
		$('.add, .update', popup).click(function(){
			var name=$('.name',popup).val();
			var color=$('.colors .active', popup).css('background-color');
			if(name=="")			
				$('.errors', popup).append('<li>Name Empty</li>');
			
			if(typeof color == "undefined")
				$('.errors', popup).append('<li>Pick a color</li>');

			if($('.errors li', popup).length>0)
				return;

			if(racer!=null)		
				updateRacer(racer, {name:name,color:color});
			else
				addRacer({name:name,color:color});
			updateRacerStorage();
			$.magnificPopup.close();
		});
		$('.delete', popup).click(function(){
			racer.remove();
			updateRacerStorage();
			$.magnificPopup.close();
		});
		$('.reset', popup).click(function(){
			var setup=racer.data('setup');
			setup.bestTime=false;
			setup.lastTime=false;
			setup.last_elapsed=false;
			setup.laps=false;
			updateRacer(racer, setup);
			updateRacerStorage();
		});
		$('.close', popup).click(function(){
			$.magnificPopup.close();
		});
		if(racer!=null)
		{
			$('.update', popup).show();
			$('.reset', popup).show();
			$('.delete', popup).show();
			var setup=racer.data('setup');
			$('.name',popup).val(setup.name);
			$('.colors .color', popup).filter(function(){
			    var color = $(this).css("background-color").toLowerCase();
			    return color === setup.color;
			}).addClass('active');
		}
		else
		{
			$('.add', popup).show();
		}
	}
	function addRacer(setup)
	{
		var racer=$('<div class="inner"></div>');
		racer.append('<span class="name"></span>');		
		racer.append('<span class="best-time"></span>');
		racer.append('<span class="last-time"></span>');
		racer=$('<div class="racer"></div>').append(racer);
		racer.append('<span class="laps"></span>');
		
		updateRacer(racer,setup);
		$('.racers-grid').append(racer);
	}
	function updateRacer(racer, setup)
	{
		$('.name', racer).html("").append(setup.name);
		var minutes, seconds, millis;
		if(setup.bestTime)
		{
			minutes = Math.floor(setup.bestTime / 60000);
  			seconds = ((setup.bestTime % 60000) / 1000).toFixed(0);
  			millis = ((setup.bestTime % 1000) / 10).toFixed(0);
  			$('.best-time', racer).html((minutes < 10 ? '0' : '') + minutes + ":" + (seconds < 10 ? '0' : '') + seconds + ":" + (millis < 10 ? '0' : '') + millis);
		}
		else
		{
			$('.best-time', racer).html('--:--:--');
		}
		if(setup.lastTime)
		{
			minutes = Math.floor(setup.lastTime / 60000);
  			seconds = ((setup.lastTime % 60000) / 1000).toFixed(0);
  			millis = ((setup.lastTime % 1000) / 10).toFixed(0);
  			$('.last-time', racer).html((minutes < 10 ? '0' : '') + minutes + ":" + (seconds < 10 ? '0' : '') + seconds + ":" + (millis < 10 ? '0' : '') + millis);
		}
		else
		{
			$('.last-time', racer).html('--:--:--');
		}
		
		$('.laps', racer).html("").append(setup.laps?setup.laps:0);
		racer.css('background-color',setup.color);
		racer.data('setup',setup);
		racer.off();
		racer.click(racerClick);
	}
	function racerClick()
	{
		if(edit_mode)
		{
			setupRacerPopup($(this));
		}
		else
		{
			var setup=$(this).data('setup');
			if(!setup.laps)
				setup.laps=0;
			setup.laps++;
			if(timerInt)
			{
				if(!setup.last_elapsed)
					setup.last_elapsed=0;
				var laptime=elapsedTime-setup.last_elapsed;
				if(!setup.bestTime)
				{
					setup.bestTime=laptime;
				}
				else
				{
					setup.bestTime=laptime<setup.bestTime?laptime:setup.bestTime;
				}
				setup.lastTime=laptime;
				setup.last_elapsed=elapsedTime;
			}
			updateRacer($(this),setup);
			updateRacerStorage();
		}
	}
	function updateRacerStorage()
	{
		if (typeof(Storage) == "undefined")
			return;
		var racers=[];
		$('.racers-grid .racer').each(function(){
			racers.push($(this).data('setup'));
		});
		localStorage.setItem("racers", JSON.stringify(racers));
	}
	function updateOptionsStorage()
	{
		if (typeof(Storage) == "undefined")
			return;
		var options = {
			'counter-mode':$('.options-popup input[name="counter-mode"]:checked').val(),
			'race-duration':parseInt($('.options-popup input.minutes').val()) || ''
		};
		countDirection=options['counter-mode'];
		localStorage.setItem("options", JSON.stringify(options));
	}

	
	function init()
	{
		if (typeof(Storage) == "undefined")
			return;
		
		var racers = JSON.parse(localStorage.getItem("racers"));
		for(var i in racers)
		{
			addRacer(racers[i]);
		}
		var options = JSON.parse(localStorage.getItem("options"));
		if(options!=null)
		{
			if(typeof options['race-duration'] != 'undefined')
				$('.options-popup input.minutes').val(options['race-duration']);
			if(typeof options['counter-mode'] != 'undefined')				
				$('.options-popup input[name="counter-mode"][value="'+options['counter-mode']+'"]').attr('checked',true).change();
		}
		else
		{
			$('#counter-mode-up').attr('checked',true);
		}


		
	}
	function toggleFullScreen()
	{
	  var isInFullScreen = (document.fullscreenElement && document.fullscreenElement !== null) ||
	        (document.webkitFullscreenElement && document.webkitFullscreenElement !== null) ||
	        (document.mozFullScreenElement && document.mozFullScreenElement !== null) ||
	        (document.msFullscreenElement && document.msFullscreenElement !== null);

	    var docElm = document.documentElement;
	    if (!isInFullScreen) {
	        if (docElm.requestFullscreen) {
	            docElm.requestFullscreen();
	        } else if (docElm.mozRequestFullScreen) {
	            docElm.mozRequestFullScreen();
	        } else if (docElm.webkitRequestFullScreen) {
	            docElm.webkitRequestFullScreen();
	        } else if (docElm.msRequestFullscreen) {
	            docElm.msRequestFullscreen();
	        }
	    } else {
	        if (document.exitFullscreen) {
	            document.exitFullscreen();
	        } else if (document.webkitExitFullscreen) {
	            document.webkitExitFullscreen();
	        } else if (document.mozCancelFullScreen) {
	            document.mozCancelFullScreen();
	        } else if (document.msExitFullscreen) {
	            document.msExitFullscreen();
	        }
	    }
	 
	}
	if (document.addEventListener)
	{
	    document.addEventListener('webkitfullscreenchange', exitFullScreen, false);
	    document.addEventListener('mozfullscreenchange', exitFullScreen, false);
	    document.addEventListener('fullscreenchange', exitFullScreen, false);
	    document.addEventListener('MSFullscreenChange', exitFullScreen, false);
	}

	function exitFullScreen()
	{
		var isInFullScreen = (document.fullscreenElement && document.fullscreenElement !== null) ||
	        (document.webkitFullscreenElement && document.webkitFullscreenElement !== null) ||
	        (document.mozFullScreenElement && document.mozFullScreenElement !== null) ||
	        (document.msFullscreenElement && document.msFullscreenElement !== null);

	    if (!isInFullScreen)
	    {
	        $('#full-screen').html('<i class="fas fa-expand-arrows-alt"></i>');
	    }
	    else
	    {
	    	 $('#full-screen').html('<i class="fas fa-compress"></i>');
	    }
	}

	init();
});

