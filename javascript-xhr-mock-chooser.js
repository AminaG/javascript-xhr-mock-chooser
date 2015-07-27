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
	xhrWindow=$('<div><style>select.response { vertical-align:middle;width: 100px;  overflow: hidden;}span.request {vertical-align: top;    width: 240px;     display: inline-block;    overflow: hidden;}.chooser-container li {  border-bottom: 1px solid rgb(92, 139, 159);padding: 5px 0px;list-style-type: decimal}</style>Javascript-Xhr-moch-Chooser<br><div class=choose-error></div><ul class=chooser-container></ul>Show and Hide by Pressing Ctrl+Alt+Shft+f</div>')
	xhrWindow.css({
		right:0,
		bottom:0,
		backgroundColor:'skyblue',
		position:'absolute',
		width:400,
		height:300,
		"overflow-y":'scroll'
	})

	$(document.body).append(xhrWindow)
	if (localStorage['xhr_show']!='true')
		xhrWindow.hide()
	else{
		xhrWindow.show()
	}
	$(document).on('keydown',function(e){		
		if(e.altKey && e.shiftKey && e.ctrlKey && e.keyCode==70){
			xhrWindow.toggle();
			updateObj();
			localStorage['xhr_show']=! (localStorage['xhr_show']=='true');
		}
	})
}

function updateObj(){
	if (xhrWindow.is(':visible'))
		XMLHttpRequest=mockXHR;
	else
		XMLHttpRequest=_xhrOriginal;	
}
function getSettings(){
	$.ajax({
		url:'settings.json',
		dataType:'json',
		error:function(){
			$('.choose-error').text('Cannot read settings.json or it is not JSON')
		},
		success:function(ans){
			if(localStorage['xhr_show']==undefined && ans.default_show){
				xhrWindow.show();
				updateObj()
			}
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
				var element=$(st)
				element.find('.request').html((data[i].name? data[i].name  + '<br>':'')  + (data[i].method!='get'?data[i].method:'') + ' ' + data[i].url).attr('title',data[i].request).
				attr('data',JSON.stringify({method:data[i].method || 'get',url:data[i].url}))

				var options=$()
				if(typeof data[i].response=='object' && data[i].response.length){
					for(var x in data[i].response)
					options=options.add( $('<option>')
							.data('value',JSON.stringify(data[i].response[x].response))
							.text(data[i].response[x].name || data[i].response[x].response)
					)
				}
				else{
					options=options.add( $('<option>')
						.data('value',JSON.stringify(data[i].response))
						.text('Enabled')
					)
				}
				
				options=options.add( $('<option>').data('value','0').text('Disabled')  )
				element.find('.response').append(options)
				element.find('select').attr({
					'name':data[i].url,
					'method':data[i].method || 'post'
					}).on('change',function(){					
					localStorage['xhr_' + this.getAttribute('method') + '_' + this.name] = $('option:selected',this).data('value');
				})
				$('.chooser-container').append(element)
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

    objFake.open=function(method,url,async){
        objFake.method=method.toLowerCase();
        objFake.url=url.toLowerCase();
        objFake.async=async
        var found=$('.request').filter(function(){
        var o=JSON.parse(this.getAttribute('data'));
        return ((o.method==method.toLowerCase() || o.method=='get') && o.url.toLowerCase()==url.toLowerCase())
        })
        if(found.length>0){
            var val=found.closest('li').find('option:selected').data('value')
            if(val=="0") {

            }
            else{
               try{
                  objFake.mock=JSON.parse(val)
                }
                catch(adasd){
                    objFake.mock=val
                }
            }
        }
        (new FakeXMLHttpRequest()).open.apply(objFake,arguments);
        objReal.open.apply(objReal,arguments);        
    }
    objFake.send=function(){
  
        if(objFake.mock && xhrWindow.is(':visible')){
          objFake.statusText="OK";
          objFake.respond(objFake.mock.status || 200,{'Content-Type':
          typeof objFake.mock=='object' ? 'application/json' : 'text/html'
          },objFake.mock);
//           (new FakeXMLHttpRequest).send.apply(objFake,arguments);
        }
        else{          
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





