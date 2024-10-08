


window.scSiLib = {};


scSiLib.addRule = function(pNode, pRule) {
	if( ! pNode.scSSRules) pNode.scSSRules = [pRule];
	else pNode.scSSRules[pNode.scSSRules.length] = pRule;
}


scSiLib.fireResizedNode = function(pNode) {
	let i;
	let vStack;
	if(!pNode) return;
	const vEvent = {
		resizedNode: pNode,
		phase: 1,
		stopBranch: false,
		stopEvent: false
	};

	const vDepthStack = [];
	let vCh = pNode;
	let vDepth = 0;

	while(vCh) {
		if("scSSRules" in vCh) {

			this.xFireOnNode(vCh, true, vEvent);
			if(vEvent.stopEvent) return;
			if(vDepth>0) {
				vStack = vDepthStack[vDepth];
				if( ! vStack) vDepthStack[vDepth] = [vCh];
				else vStack[vStack.length] = vCh;
			}
		}
		if( ! vEvent.stopBranch && vCh.hasChildNodes()) {
			vCh = vCh.firstChild;
			vDepth++;
		} else {
			if(vEvent.stopBranch) vEvent.stopBranch = false;
			while( ! vCh.nextSibling) {
				vCh = vCh.parentNode;
				vDepth--;
				if(vDepth<=0) {
					vCh = null;
					break;
				}
			}
			if(vCh) vCh = vCh.nextSibling;
		}
	}

	vEvent.phase = 2;
	for(i = vDepthStack.length-1; i>0; i--) {
		vStack = vDepthStack[i];
		if(vStack) for(let j = vStack.length-1; j>=0; j--) {
			this.xFireOnNode(vStack[j], true, vEvent);
			if(vEvent.stopEvent) return;
		}		
	}
	if(pNode.scSSRules) this.xFireOnNode(pNode, true, vEvent);
	


	vEvent.phase = 1;
	let vAnc = pNode;
	vStack = [];
	while(vAnc) {
		if(vAnc.scSSRules) {
			this.xFireOnNode(vAnc, false, vEvent);
			if(vEvent.stopEvent) return;
			vStack[vStack.length] = vAnc;
		}
		vAnc = vAnc.parentNode;
	}

	vEvent.phase = 2;
	for(i = vStack.length-1; i>=0; i--) {
		this.xFireOnNode(vStack[i], false, vEvent);
		if(vEvent.stopEvent) return;
	}
}


scSiLib.getContentHeight = function(pContainer) {
	let vCh = pContainer.lastChild;
	let vH = 0;
	while(vCh && ( vCh.nodeType !== 1 || ! (vH = vCh.offsetHeight) ) ) vCh = vCh.previousSibling;
	if(vCh) {
		return vCh.offsetTop + vH;
	}
	return Number.NaN;
}

scSiLib.getOffsetTop = function(pNode, pContainer) {
	let vParent = pNode.offsetParent;
	if( ! vParent) return Number.NaN;
	let vOffset = pNode.offsetTop - vParent.scrollTop;
	while(vParent !== pContainer) {
		const vNewParent = vParent.offsetParent;
		if( ! vNewParent) return Number.NaN;
		vOffset += vParent.offsetTop - vNewParent.scrollTop;
		vParent = vNewParent;
	}
	return vOffset;
}


scSiLib.onResize = function(){
	this.fireResizedNode(document.body);
}
scSiLib.resizeSortKey = "SS";
scOnResizes[scOnResizes.length] = scSiLib;


scSiLib.xFireOnNode = function(pNode, pOnResizedAnc, pEvent){
	const vRules = pNode.scSSRules;
	const vLen = vRules.length;
	let i;
	if(vLen > 1 && vLen !== vRules.lastLen) {
		vRules.sort(function (p1, p2){
				if(!p1.ruleSortKey) return p2.ruleSortKey ? -1 : 0;
				if(scCoLib.isIE) return p1.ruleSortKey.localeCompare(p2.ruleSortKey||"");
				try{
					return p1.ruleSortKey > p2.ruleSortKey||"" ? 1 : p1.ruleSortKey === p2.ruleSortKey ? 0 : -1;
				}catch(e){
					return p1.ruleSortKey.localeCompare(p2.ruleSortKey||"");
				}
			}
		);
		vRules.lastLen = vLen;
	}
	if(pOnResizedAnc) {
		for (i = 0; i < vLen; i++) try{vRules[i].onResizedAnc(pNode, pEvent);}catch(e){}
	}
	else for (i = 0; i < vLen; i++) try{vRules[i].onResizedDes(pNode, pEvent);}catch(e){}
}
