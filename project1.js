$(document).ready(function(){

    //An array of different earnings, will be added with thousand separator by the function addThousandSeparator();
    var earningList = [0, 500, 1000, 2000, 5000, 10000, 20000, 50000, 75000, 150000, 250000, 500000, 1000000];

    var $quizContainer = $('#quizContainer');
    var $logoContainer = $('#logoContainer');
    var $infoContainer = $('#infoContainer');
    var $lifeline = $('#lifeline');
    var $lifelineIcon = $(".lifelineIcon");
    var $level = $('#level');
    var $btnClickSound = $('#btnClickSound');
    var $sound = $('#sound');
    var $bgMusic = $("#gamemusic");
    var $audio = $('audio');

    //play background music when the page is loaded;
    $bgMusic.get(0).play();

    //sound button to turn on and off;
    $sound.click(function() {
        var srcSoundon = "images/sound-on.png";
        var srcSoundoff = "images/sound-off.png";
        var src = $sound.find("img").attr("src");
        if(src == srcSoundon) {
            $sound.find("img").attr("src",srcSoundoff);
            $.each($audio, function(i,val){
                val.muted = true;
            })
        } else {
            $sound.find("img").attr("src",srcSoundon);
            $.each($audio, function(i,val){
                val.muted = false;
            })
        }
    });

    //show help information when the help button is clicked, introduce how to play the game;
    $("#helpBtn").click(function(){
        $logoContainer.hide();
        $quizContainer.show();
        var text = "<p>You will have 12 questions to answer in sequence valuing from &pound 500 to 1 million. You can choose to quit and claim your earnings before proceeding to the next question;</p>" +
                "<h6>Milestones:</h6><p>Q2 and Q7, where you get the minimum payout &pound 1,000 and &pound 5,000; </p>" +
            "<h6>Time:</h6><p>15 seconds for Q1 & Q2; 30 seconds for Q3-Q7; no time limits after Q8; </p>" +
                "<h6>Lifeline:</h6><p>use for help and <b>once</b> only. </p>" +
            "<p><img src='images/lifeline_5050.png' style='width: 4rem; height: 2rem'>  The computer eliminates two random wrong answers; </p>"+
                "<p><img src='images/lifeline_switch.png' style='width: 4rem; height: 2rem'>  The computer will change a question with the same difficulty level for you.</p>";
        var helpInfo = $("<div></div>");
        helpInfo.html(text);
        helpInfo.css({"text-align":"left", "overflow":"scroll"});
        helpInfo.find("p").css("font-size","14px");
        $quizContainer.append(helpInfo);
        var back = $("<img src='images/back.png' alt='back'>");
        $quizContainer.append(back);
        //back to the index;
        back.click(function(){
            $quizContainer.empty();
            $quizContainer.hide();
            $logoContainer.show();
        });

    })


    //when the player starts the game;
    $('#playBtn').click(function(){
        //hide logo and show quiz container;
        $logoContainer.hide();
        $quizContainer.show();
        $infoContainer.show();
        $lifeline.fadeIn();

        //css animation of lifeline images, click and show text shadow
        $lifelineIcon.one("mousedown",function(){
            $(this).animate({
                left: "+=3px",
                top: "1px"
            },"fast"
            );
        });

        $lifelineIcon.mouseup(function(){
            $(this).animate({
                left: "0",
                top: "0"
            },"fast");
        });


        //generate new token to avoid duplicated questions;
        $.getJSON("https://opentdb.com/api_token.php?command=request", function(result) {
            //generate new token
            var newToken = result.token;
            //console.log(newToken);

            //call the function generateQuestionList(token), to get a list of questions;
            var questionList = generateQuestionList(newToken);
            //console.log(questionList);
            //call the function renderQuestion, and starts from the first question;
            renderQuestion(questionList, 0);
            //call the function setEarningLevel to present the level info in the info bar;
            setEarningLevel(1);


            /*-----------------------lifeline-------------*/
            //lifeline5050: Remove 2 incorrect answers randomly, can only be used once
            $("#lifeline5050").one("click",function(){
                var currentIndex = parseInt($level.text().split(" ")[1]);
                var incorrectAnswers = questionList[currentIndex-1].incorrect_answers;
                //console.log(incorrectAnswers);
                //call the function remove2IncorrectAnswers to remove 2 incorrect answers of this question;
                remove2IncorrectAnswers(incorrectAnswers);
                //The 5050 icon disappers after it is clicked;
                $(this).css("display","none");
            })


            //lifelineSwitch: change a question with the same difficulty level
            $("#lifelineSwitch").one("click",function(){
                var currentIndex = parseInt($level.text().split(" ")[1]);
                var difficulty = questionList[currentIndex-1].difficulty;
                //console.log(difficulty);
                //generate a new question
                var newUrl = "https://opentdb.com/api.php?token=" + newToken + "&type=multiple&amount=1&difficulty=" + difficulty;
                $.getJSON(newUrl, function(data){
                    var backupQuestion = data.results[0];
                    //console.log(backupQuestion);
                    //insert the backup question to the question list;
                    questionList[currentIndex-1] = backupQuestion;
                    stopCounting();
                    renderQuestion(questionList,currentIndex-1);
                })
                $(this).css("display","none");
            })

        } );

    })



    //generate all questions at one time;
    function generateQuestionList(token) {
        var url = "https://opentdb.com/api.php?token=" + token + "&type=multiple";
        var questionList = [];
        //synchronous processing
        $.ajaxSettings.async = false;
        $.getJSON(url+"&difficulty=easy&amount=2", function(data) {
            $.merge(questionList, data.results);
        });
        $.getJSON(url+"&difficulty=medium&amount=5", function(data) {
            $.merge(questionList, data.results);
        });
        //get 5 hard questions
        $.getJSON(url+"&difficulty=hard&amount=5", function(data) {
            $.merge(questionList, data.results);
        });
        $.ajaxSettings.async = true;
       // console.log(questionList);
        return questionList;
    }




    //render question from the questionList;
    function renderQuestion(questionList, i) {
        var questionIndex = i;
        var $timer = $('#timer');

        //set time limit;
        //Question 1-2 are given 15s to answer, Question 3-7 30s, question 8-12 no time limit.
        switch (questionIndex) {
            case 0:
            case 1:
                $timer.html("Time: <span id='count'>15</span>");
                countingDown(15,questionIndex);
                break;
            case 2: case 3: case 4: case 5: case 6:
                $timer.html("Time: <span id='count'>30</span>");
                countingDown(30,questionIndex);
                break;
            default:
                $timer.empty();
        }


        setEarningLevel(questionIndex+1);

        $quizContainer.empty();
        $quizContainer.append("<div class='question'>"+ questionList[i].question + "</div>");
        $quizContainer.append("<form class='options'></form>");
        $quizContainer.append("<button id='confirmBtn'>Confirm</button>");

        $("#lifeline").show();
        $quizContainer.css("margin-top","");

        var correctAnswer = questionList[i].correct_answer;

        //decode html string to normal string, remove escape string entities such as &amp;
        correctAnswer = htmlDecode(correctAnswer);
        //check the correct answer of this question in the console, for test use only;
        console.log(correctAnswer);

        //show the options;
        var optionList = [];
        optionList = optionList.concat(questionList[i].correct_answer, questionList[i].incorrect_answers);
        //sort the options in the array in a random order
        optionList.sort(function(a, b){return 0.5 - Math.random()});

        $.each(optionList, function(i, val) {
            $(".options").append("<label><input type='radio' name='option' value='" + val + "'> " + val +"</label>");
        });

        //add css to the labels, text shadow on hover;
        var $label = $('label');
        $label.mouseover(function() {
            $(this).css("text-shadow","2px 2px 5px red, 0 0 30px yellow, 0 0 50px white");
        })

        $label.mouseout(function() {
            $(this).css("text-shadow","");
        })


        //confirm the answer of this question;
        $('#confirmBtn').click(function(){
            //button click sound play;
            $btnClickSound.get(0).play();

            //check whether the answer is correct;
            var selectedAnswer = $('input[name="option"]:checked').val();
            if(selectedAnswer) {
                //stop time counting;
                stopCounting();
                $timer.empty();
                //when the answer is correct, ask user whether to continue or not;
                if(selectedAnswer == correctAnswer) {
                    //when it is not the last question;
                    if(questionIndex < 11) {
                        $("#applaudSound").get(0).play();

                        $quizContainer.html("<p>Great! You've answered this question correctly. You have earned &pound" + addThousandSeparator(earningList[questionIndex+1]) + ". Do you want to proceed to the next question?</p>" +
                            "<p>Next challenge: &pound" + addThousandSeparator(earningList[questionIndex+2]) + "</p>" +
                            "<button id='yesBtn'>Yes</button><button id='noBtn'>No</button>");
                        $level.empty();
                        $lifeline.hide();

                        //If the player choose to continue, render the next question;
                        $('#yesBtn').click(function() {
                            $btnClickSound.get(0).play();
                            questionIndex += 1;
                            renderQuestion(questionList, questionIndex);
                        })

                        //If the player choose to quit game and calculate earnings;
                        $('#noBtn').click(function() {
                            $btnClickSound.get(0).play();
                            $quizContainer.html("<p>Thank you for joining the game! You have won &pound"+ addThousandSeparator(earningList[questionIndex+1]) +
                                "! </p><button class='restart'>Play again</button>");
                            playAgain();
                            $lifeline.hide();
                            $quizContainer.css("margin-top","10rem");
                        })
                    }

                    //When the last question is answered correctly, gold rain;
                    if(questionIndex == 11) {
                        $('div','#goldContainer').show();
                        goldRain();
                        $bgMusic.get(0).pause();
                        $("#winSound").get(0).play();
                        $quizContainer.html("<section class='glow'><p>Congratulations!</p><p>MILLIONAIRE!</p></section>" +
                            "<button class='restart'>Play again</button>");
                        //Restart, the window is reloaded;
                        $(".restart").click(function(){
                            window.location.reload();
                        })
                    }

                }
                else {
                    //console.log(questionIndex);
                    alert("Wrong answer!");
                    $("#negativeSound").get(0).play();
                    renderGameOver(questionIndex);
                }
            }
            else {
                alert("Please choose one option!");
            }

        })







    }



   function playAgain() {
        $(".restart").click(function(){
            window.location.reload();
        })
    }

    //Game over and calculate the earnings. milestones are 1000 and 5000;
    function renderGameOver(index) {
        $bgMusic.get(0).pause();
        $("#failSound").get(0).play();
        $quizContainer.empty();
        $infoContainer.hide();
        $lifeline.hide();
        $quizContainer.css("margin-top","10rem");
        var earning;
        if(index < 2) {
            earning = earningList[0];
        }
        if(index > 2 && index <7) {
            earning = addThousandSeparator(earningList[2]);
        }
        if(index > 7) {
            earning = addThousandSeparator(earningList[7]);
        }

        //console.log(earning);

        $quizContainer.html("<h3>Game Over!</h3><p>Your total earnings: &pound" + earning +
            "</p><button class='restart'>Play Again</button>");

        playAgain();

    }


    function setEarningLevel(level) {
        var levelEarning = addThousandSeparator(earningList[level]);
        $level.html("Question " + level + " Worth &pound" + levelEarning);
    }

    //add thousand separator to the number, suitable for integer without decimals
    function addThousandSeparator(num) {
        var num = num.toString();
        var result = '';
        while(num.length > 3) {
            result = "," + num.slice(-3) + result;
            num = num.slice(0, num.length-3);
        }
        if(num) {
            result = num + result;
        }
        return result;
    }

    //convert strings with html escape sequences (e.g. &#039;) to normal string(')
    function htmlDecode(string){
        if (string)
            return $('<div></div>').html(string).text();
    }


    //time counting down, when only 5s left, the time turns to red to inform the player;
    function countingDown(seconds, questionIndex) {
        var time = seconds;
        var $count = $("#count");
        countDown = setInterval(function(){
                time--;
                $count.html(time);
            if(time <= 5) {
                $count.css({"color":"red", "font-size":"18px", "font-weight": "bolder"});
            }
            if(time < 0) {
                $count.html(0);
                stopCounting();
                $("#timeoutSound").get(0).play();
                alert("Time's up!");
                renderGameOver(questionIndex);
            }
            },1000);
    }


    function stopCounting() {
        clearInterval(countDown);
    }


    //remove 2 incorrect answers randomly from the incorrect answer list;
    function remove2IncorrectAnswers(answerList) {
        var array = getRandomArrayElements(answerList, 2);
        //console.log("array 2" + array);
        $.each(array, function(i,val) {
            $(".options").find("input[name='option']").each(function() {
                if($(this).val() == htmlDecode(val)) {
                    $(this).parent().empty();
                }
            })
        })

    }


    //get random elements from the array;
    function getRandomArrayElements(arr, count) {
        var shuffled = arr.slice(0), i = arr.length, min = i - count, temp, index;
        while (i-- > min) {
            index = Math.floor((i + 1) * Math.random());
            temp = shuffled[index];
            shuffled[index] = shuffled[i];
            shuffled[i] = temp;
        }
        return shuffled.slice(min);
    }


    $("button").click(function(){
        $btnClickSound.get(0).play();
    })


    $lifelineIcon.click(function(){
        $("#lifelineSound").get(0).play();
    })


})