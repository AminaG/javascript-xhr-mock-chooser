///
/**
 * Minimal Event interface implementation
 *
 * Original implementation by Sven Fuchs: https://gist.github.com/995028
 * Modifications and tests by Christian Johansen.
 *
 * @author Sven Fuchs (svenfuchs@artweb-design.de)
 * @author Christian Johansen (christian@cjohansen.no)
 * @license BSD
 *
 * Copyright (c) 2011 Sven Fuchs, Christian Johansen
 */
function parseXML(e){var t;if("undefined"!=typeof DOMParser){var s=new DOMParser;t=s.parseFromString(e,"text/xml")}else t=new ActiveXObject("Microsoft.XMLDOM"),t.async="false",t.loadXML(e);return t}function _addEventListener(e,t){t.addEventListener(e,function(s){var n=t["on"+e];n&&"function"==typeof n&&n(s)})}function EventedObject(){this._eventListeners={};for(var e=["loadstart","progress","load","abort","loadend"],t=e.length-1;t>=0;t--)_addEventListener(e[t],this)}function FakeXMLHttpRequest(){EventedObject.call(this),this.readyState=FakeXMLHttpRequest.UNSENT,this.requestHeaders={},this.requestBody=null,this.status=0,this.statusText="",this.upload=new EventedObject}function verifyState(e){if(e.readyState!==FakeXMLHttpRequest.OPENED)throw new Error("INVALID_STATE_ERR");if(e.sendFlag)throw new Error("INVALID_STATE_ERR")}function verifyRequestSent(e){if(e.readyState==FakeXMLHttpRequest.DONE)throw new Error("Request done")}function verifyHeadersReceived(e){if(e.async&&e.readyState!=FakeXMLHttpRequest.HEADERS_RECEIVED)throw new Error("No headers received")}function verifyResponseBodyType(e){if("string"!=typeof e){var t=new Error("Attempted to respond to fake XMLHttpRequest with "+e+", which is not a string.");throw t.name="InvalidBodyException",t}}var _Event=function(e,t,s,n){this.type=e,this.bubbles=t,this.cancelable=s,this.target=n};_Event.prototype={stopPropagation:function(){},preventDefault:function(){this.defaultPrevented=!0}};var httpStatusCodes={100:"Continue",101:"Switching Protocols",200:"OK",201:"Created",202:"Accepted",203:"Non-Authoritative Information",204:"No Content",205:"Reset Content",206:"Partial Content",300:"Multiple Choice",301:"Moved Permanently",302:"Found",303:"See Other",304:"Not Modified",305:"Use Proxy",307:"Temporary Redirect",400:"Bad Request",401:"Unauthorized",402:"Payment Required",403:"Forbidden",404:"Not Found",405:"Method Not Allowed",406:"Not Acceptable",407:"Proxy Authentication Required",408:"Request Timeout",409:"Conflict",410:"Gone",411:"Length Required",412:"Precondition Failed",413:"Request Entity Too Large",414:"Request-URI Too Long",415:"Unsupported Media Type",416:"Requested Range Not Satisfiable",417:"Expectation Failed",422:"Unprocessable Entity",500:"Internal Server Error",501:"Not Implemented",502:"Bad Gateway",503:"Service Unavailable",504:"Gateway Timeout",505:"HTTP Version Not Supported"},unsafeHeaders={"Accept-Charset":!0,"Accept-Encoding":!0,Connection:!0,"Content-Length":!0,Cookie:!0,Cookie2:!0,"Content-Transfer-Encoding":!0,Date:!0,Expect:!0,Host:!0,"Keep-Alive":!0,Referer:!0,TE:!0,Trailer:!0,"Transfer-Encoding":!0,Upgrade:!0,"User-Agent":!0,Via:!0};EventedObject.prototype={addEventListener:function(e,t){this._eventListeners[e]=this._eventListeners[e]||[],this._eventListeners[e].push(t)},removeEventListener:function(e,t){for(var s=this._eventListeners[e]||[],n=0,r=s.length;r>n;++n)if(s[n]==t)return s.splice(n,1)},dispatchEvent:function(e){for(var t=e.type,s=this._eventListeners[t]||[],n=0;n<s.length;n++)"function"==typeof s[n]?s[n].call(this,e):s[n].handleEvent(e);return!!e.defaultPrevented},_progress:function(e,t,s){var n=new _Event("progress");n.target=this,n.lengthComputable=e,n.loaded=t,n.total=s,this.dispatchEvent(n)}},FakeXMLHttpRequest.prototype=new EventedObject,FakeXMLHttpRequest.UNSENT=0,FakeXMLHttpRequest.OPENED=1,FakeXMLHttpRequest.HEADERS_RECEIVED=2,FakeXMLHttpRequest.LOADING=3,FakeXMLHttpRequest.DONE=4;var FakeXMLHttpRequestProto={UNSENT:0,OPENED:1,HEADERS_RECEIVED:2,LOADING:3,DONE:4,async:!0,open:function(e,t,s,n,r){this.method=e,this.url=t,this.async="boolean"==typeof s?s:!0,this.username=n,this.password=r,this.responseText=null,this.responseXML=null,this.requestHeaders={},this.sendFlag=!1,this._readyStateChange(FakeXMLHttpRequest.OPENED)},setRequestHeader:function(e,t){if(verifyState(this),unsafeHeaders[e]||/^(Sec-|Proxy-)/.test(e))throw new Error('Refused to set unsafe header "'+e+'"');this.requestHeaders[e]?this.requestHeaders[e]+=","+t:this.requestHeaders[e]=t},send:function(e){if(verifyState(this),!/^(get|head)$/i.test(this.method)){if(this.requestHeaders["Content-Type"]){var t=this.requestHeaders["Content-Type"].split(";");this.requestHeaders["Content-Type"]=t[0]+";charset=utf-8"}else this.requestHeaders["Content-Type"]="text/plain;charset=utf-8";this.requestBody=e}this.errorFlag=!1,this.sendFlag=this.async,this._readyStateChange(FakeXMLHttpRequest.OPENED),"function"==typeof this.onSend&&this.onSend(this),this.dispatchEvent(new _Event("loadstart",!1,!1,this))},abort:function(){this.aborted=!0,this.responseText=null,this.errorFlag=!0,this.requestHeaders={},this.readyState>FakeXMLHttpRequest.UNSENT&&this.sendFlag&&(this._readyStateChange(FakeXMLHttpRequest.DONE),this.sendFlag=!1),this.readyState=FakeXMLHttpRequest.UNSENT,this.dispatchEvent(new _Event("abort",!1,!1,this)),"function"==typeof this.onerror&&this.onerror()},getResponseHeader:function(e){if(this.readyState<FakeXMLHttpRequest.HEADERS_RECEIVED)return null;if(/^Set-Cookie2?$/i.test(e))return null;e=e.toLowerCase();for(var t in this.responseHeaders)if(t.toLowerCase()==e)return this.responseHeaders[t];return null},getAllResponseHeaders:function(){if(this.readyState<FakeXMLHttpRequest.HEADERS_RECEIVED)return"";var e="";for(var t in this.responseHeaders)this.responseHeaders.hasOwnProperty(t)&&!/^Set-Cookie2?$/i.test(t)&&(e+=t+": "+this.responseHeaders[t]+"\r\n");return e},_readyStateChange:function(e){this.readyState=e,"function"==typeof this.onreadystatechange&&this.onreadystatechange(),this.dispatchEvent(new _Event("readystatechange")),this.readyState==FakeXMLHttpRequest.DONE&&(this.dispatchEvent(new _Event("load",!1,!1,this)),this.dispatchEvent(new _Event("loadend",!1,!1,this)))},_setResponseHeaders:function(e){this.responseHeaders={};for(var t in e)e.hasOwnProperty(t)&&(this.responseHeaders[t]=e[t]);this.async?this._readyStateChange(FakeXMLHttpRequest.HEADERS_RECEIVED):this.readyState=FakeXMLHttpRequest.HEADERS_RECEIVED},_setResponseBody:function(e){verifyRequestSent(this),verifyHeadersReceived(this),verifyResponseBodyType(e);var t=this.chunkSize||10,s=0;this.responseText="";do this.async&&this._readyStateChange(FakeXMLHttpRequest.LOADING),this.responseText+=e.substring(s,s+t),s+=t;while(s<e.length);var n=this.getResponseHeader("Content-Type");if(this.responseText&&(!n||/(text\/xml)|(application\/xml)|(\+xml)/.test(n)))try{this.responseXML=parseXML(this.responseText)}catch(r){}this.async?this._readyStateChange(FakeXMLHttpRequest.DONE):this.readyState=FakeXMLHttpRequest.DONE},respond:function(e,t,s){this._setResponseHeaders(t||{}),this.status="number"==typeof e?e:200,this.statusText=httpStatusCodes[this.status],this._setResponseBody(s||"")}};for(var property in FakeXMLHttpRequestProto)FakeXMLHttpRequest.prototype[property]=FakeXMLHttpRequestProto[property];
////////////////////////////////////////////





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
			debugger
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
        return ((o.method==objFake.method.toLowerCase() || o.method=='get') && 
        		(
        			o.url.toLowerCase()==objFake.url.toLowerCase() ||
        			objFake.url.match(globToRegex(o.url.toLowerCase()))
        		)

        	);
        })
        if(found.length>0){
            var val=found.closest('li').find('option:selected').data('value');
            if(val=="0") {

            }
            else{
	        	var l=found.closest('li');
	        	l.css('background-color','orange')
	        	setTimeout(function(){
	        		l.css('background-color','')
	        	},500)
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
          requestHeaders=[]
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
            requestHeaders=[]
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


function globToRegex (glob) {
    var specialChars = "\\^$*+?.()|{}[]";
    var regexChars = ["^"];
    for (var i = 0; i < glob.length; ++i) {
        var c = glob.charAt(i);
        switch (c) {
            // case '?':
            //     regexChars.push(".");
            //     break;
            case '*':
                regexChars.push(".*");
                break;
            default:
                if (specialChars.indexOf(c) >= 0) {
                    regexChars.push("\\");
                }
                regexChars.push(c);
        }
    }
    regexChars.push("$");
    return new RegExp(regexChars.join(""));
}