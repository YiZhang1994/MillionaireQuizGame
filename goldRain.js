/***********gold rain*************/
//reference: http://www.2cto.com/kf/201302/190012.html

var goldFallInterval;
var goldFallStart=0;
function initGoldFall(){
    var length = $('div','#goldContainer').length;

    if(length<4){
        for(i=0;i<6;i++){
            $('div','#goldContainer').clone().prependTo('#goldContainer');
        }
    }

}
function startGoldFall(){
    clearInterval(goldFallInterval);
    endCount = 0;
    range();
    goldFallStart = new Date().getTime();
    goldFallInterval= setInterval(dropGoldFall,200);
}

//position arrangement of gold coins
function range()
{
    var num = 1;
    $('div','#goldContainer').each(function(i)
    {
        var ww = $(window).width();
        var wh = $(window).height();

        var ot = -20;//start above the top

        $(this).css({"left":(i*(ww/64)) +"px","top":"-50px"});
        num ++;
    });
}

//gold falling
function dropGoldFall()
{
    var now =  new Date().getTime();
    if(now - goldFallStart >3000){
        clearInterval(goldFallInterval);
    }

    var $objs =  $('div','#goldContainer');
    $objs.each(function(i)
    {
        var wh   = $(window).height();
        var ol   = $(this).offset().left;
        var ot   = $(this).offset().top;
        var rnd  = Math.round(Math.random()*100);
        var rnd2 = Math.round(Math.random()*50);

        //falling speed
        //If it falls beneath the window
        if(ot<=wh)
        {
            $(this).css({"top":(ot+rnd+rnd2) +"px"});
        }
    });
}


function goldRain() {

    initGoldFall();
    var myVar;
    myVar =setInterval(function(){
        startGoldFall();
    },3000);

}

