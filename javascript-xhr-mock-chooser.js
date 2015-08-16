if(!window.jQuery || !window.jQuery.fn || !jQuery.fn.jquery){
	alert('cannot load javascript-xhr-moch-chooser.js. Jquery required')
}

function init(){
	$(function(){
		showUI();
		getSettings()
	})
}

function showUI(){
	xhrWindow=$('<div><button class=toggle>Toggle</button><style>select.response { vertical-align:middle;width: 100px;  overflow: hidden;}span.request {vertical-align: top;    width: 240px;     display: inline-block;    overflow: hidden;}.chooser-container li {  border-bottom: 1px solid rgb(92, 139, 159);padding: 5px 0px;list-style-type: decimal}</style>Javascript-Xhr-moch-Chooser<br><div class=choose-error></div><ul class=chooser-container></ul>Show and Hide by Pressing Ctrl+Alt+Shft+f</div>')
	xhrWindow.css({
		right:0,
		bottom:0,
		backgroundColor:'skyblue',
		position:'fixed',
		width:400,
		height:300,
		"overflow-y":'scroll'
	})
	xhrWindow.find('.toggle').click(function(){
		if(!localStorage.xhr_toggle){
			localStorage.xhr_toggle='a'
			xhrWindow.css({
				width:$(this).width()*2,
				height:$(this).height()*2,
				'overflow-y':'hidden',
				'overflow-x':'hidden',
			})
		}
		else{
			localStorage.xhr_toggle=''
			xhrWindow.css({
				width:400,
				height:300,
				'overflow-y':'scroll'
			})
		}
	})

	$(document.body).append(xhrWindow)

	if(localStorage.xhr_toggle=='a'){		
		localStorage.xhr_toggle=''
		xhrWindow.find('.toggle').trigger('click');
	}

	if (localStorage['xhr_show']!='true'){
		xhrWindow.hide()
		updateObj()
	}
	else{
		xhrWindow.show()
		updateObj()
	}
	$(document).on('keydown',function(e){		
		if(e.altKey && e.shiftKey && e.ctrlKey && e.keyCode==70){
			xhrWindow.toggle();
			updateObj();
			localStorage['xhr_show']=! (localStorage['xhr_show']=='true');
		}
	})
}

function isMock(){
	return (xhrWindow.is(':visible') ||  localStorage['xhr_work_only_when_open']=="false" )
}

function updateObj(){
	if (isMock())
		XMLHttpRequest=mockXHR;
	else
		XMLHttpRequest=_xhrOriginal;	
}
function getSettings(){
	$.ajax({
		url:'xhr-mock-settings.json',
		dataType:'json',
		error:function(e){
			$('.choose-error').text('Cannot read settings.json or it is not JSON,' + e.statusText )
		},
		success:function(ans){
			if(localStorage['xhr_show']==undefined && ans.default_show){
				xhrWindow.show();
				XMLHttpRequest=mockXHR;
			}
			localStorage['xhr_work_only_when_open']=ans.work_only_when_open
			var data=ans.data
			for(var i in data){
				if (!data[i].method) data[i].method='get'
			}
			var st;
			for(var i in data){
				st=''
				st='<li><span class=request></span>'
				st+='<select class=response>'
				st+='</select>'
				st+='</li>'				
				var element=$(st);
				element.find('.request').html((data[i].name? data[i].name  + '<br>':'')  + (data[i].method!='get'?data[i].method:'') + ' ' + data[i].url).attr('title',data[i].request).
				attr('data',JSON.stringify({method:data[i].method || 'get',url:data[i].url}));

				var options=$();
				if(
					typeof data[i].response=='object' &&
					data[i].response.length && 
					data[i]['content-type']==undefined	){
					//He have many subitems
					for(var x in data[i].response)
					options=options.add( $('<option>')
							.data('value',JSON.stringify(data[i].response[x].response))
							.text(data[i].response[x].name || data[i].response[x].response)
					);
				}
				else{
					//Only one item.
					options=options.add( $('<option>')
						.data('value',JSON.stringify(data[i].response))
						.text('Enabled')
					);
				}
				
				options=options.add( $('<option>').data('value','0').text('Disabled')  )
				element.find('.response').append(options)
				element.find('select').attr({
					'name':data[i].url,
					'method':data[i].method || 'post'
					}).on('change',function(){					
					localStorage['xhr_' + this.getAttribute('method') + '_' + this.name] = $('option:selected',this).data('value');
				})
				$('.chooser-container').append(element);
			}
		}
	})
}

init()



////////////////////////////////////


if (!window._xhrOriginal) window._xhrOriginal=XMLHttpRequest
window.mockXHR=function(){
    var objFake=new FakeXMLHttpRequest();    
    var objReal=new _xhrOriginal();
    var requestHeaders=[]
    objFake.setRequestHeader=function(){
    	requestHeaders.push(arguments)
    }
    objFake.open=function(method,url,async){
        objFake.method=method.toLowerCase();
        objFake.url=url.toLowerCase();
        objFake.async=async;
    }
    objFake.send=function(){
        var found=$('.request').filter(function(){
        var o=JSON.parse(this.getAttribute('data'));
        return ((o.method==objFake.method.toLowerCase() || o.method=='get') && o.url.toLowerCase()==objFake.url.toLowerCase());
        })
        if(found.length>0){
            var val=found.closest('li').find('option:selected').data('value');
            if(val=="0") {

            }
            else{
               // try{
               //    objFake.mock= (val)
               //  }
                // catch(adasd){
                    objFake.mock=val;
                // }
            }
        }
  		var i;
        if(objFake.mock && isMock() ){
          (new FakeXMLHttpRequest()).open.call(objFake,objFake.method,objFake.url);
          for(i=0;i<requestHeaders.length;i++)
          	(new FakeXMLHttpRequest()).setRequestHeader.apply(objFake,requestHeaders[i]);
          objFake.statusText="OK";
          objFake.respond(objFake.mock.status || 200,{'Content-Type':
          typeof objFake.mock=='object' ? 'application/json' : 'text/html'
          },objFake.mock);
//           (new FakeXMLHttpRequest).send.call(objFake,objFake.method,objFake.url);
        }
        else{          
            objReal.open.call(objReal,objFake.method,objFake.url); 
            for(i=0;i<requestHeaders.length;i++)
            	objReal.setRequestHeader.apply(objReal,requestHeaders[i]);
            objReal.onreadystatechange=function(){            	
                if (this.readyState==4){                    
                    objFake.status=this.status;
                    objFake.statusText=this.statusText;
                    var o={};this.getAllResponseHeaders().split('\r\n').forEach(function(val){
                    var t=val.split(': ')
                    o[t[0]]=t[1];
                    });
                    objFake.respond(objFake.status,o,this.responseText);
                }
            }
            objReal.send.apply(objReal,arguments);        
        }
    }
    return objFake;
};
