// 設定卡牌的圖片資料: 圖組別、圖來源、被翻次數
let all_cards_data = [
  ["p0", "background-image: url(img/Hanafuda/p0_January_Hikari.png);"],
  ["p0", "background-image: url(img/Hanafuda/p0_January_Hikari.png);"],
  ["p1", "background-image: url(img/Hanafuda/p1_March_Hikari.png);"],
  ["p1", "background-image: url(img/Hanafuda/p1_March_Hikari.png);"],
  ["p2", "background-image: url(img/Hanafuda/p2_August_Hikari.png);"],
  ["p2", "background-image: url(img/Hanafuda/p2_August_Hikari.png);"],
  ["p3", "background-image: url(img/Hanafuda/p3_November_Hikari.png);"],
  ["p3", "background-image: url(img/Hanafuda/p3_November_Hikari.png);"],
  ["p4", "background-image: url(img/Hanafuda/p4_December_Hikari.png);"],
  ["p4", "background-image: url(img/Hanafuda/p4_December_Hikari.png);"],
  ["p5", "background-image: url(img/Hanafuda/p5_February_Tane.png);"],
  ["p5", "background-image: url(img/Hanafuda/p5_February_Tane.png);"],
  ["p6", "background-image: url(img/Hanafuda/p6_July_Tane.png);"],
  ["p6", "background-image: url(img/Hanafuda/p6_July_Tane.png);"],
  ["p7", "background-image: url(img/Hanafuda/p7_May_Tane.png);"],
  ["p7", "background-image: url(img/Hanafuda/p7_May_Tane.png);"],
  ["p8", "background-image: url(img/Hanafuda/p8_March_Kasu_2.png);"],
  ["p8", "background-image: url(img/Hanafuda/p8_March_Kasu_2.png);"],
  ["p9", "background-image: url(img/Hanafuda/p9_October_Kasu_1.png);"],
  ["p9", "background-image: url(img/Hanafuda/p9_October_Kasu_1.png);"],
  ["p10", "background-image: url(img/Hanafuda/p10_December_Kasu_2.png);"],
  ["p10", "background-image: url(img/Hanafuda/p10_December_Kasu_2.png);"],
  ["p11", "background-image: url(img/Hanafuda/p11_October_Tane.png);"],
  ["p11", "background-image: url(img/Hanafuda/p11_October_Tane.png);"],
];

// 設定卡牌數量(常數)
const card_qty = all_cards_data.length;

// 宣告堆疊
let stack = null;

// 定義用以計時的變數interval
let interval = 0;
let seconds;
let minutes;

// 用Promise達到延遲時間
let delay = function (s) {
  return new Promise(function (resolve, reject) {
    setTimeout(resolve, s);
  });
};

// 檯面上剩餘卡牌數量 (未使用)
let unused_card_qty = card_qty;

// 定義分數排行榜列數為一常數
const leaderboard_rows = 4;

// 定義localstorage陣列，存取分數排行榜分數。
// 陣列大小比分數排行榜多一格，多存此次分數。
let leaderboard_data = new Array(leaderboard_rows + 1);

// 宣告計時器開跑變數
let stopwatchStart;

function Stack() {
  // 定義堆疊，存放代表卡牌ID的字串。
  let items = [];

  function push(id_string) {
    if (!check_is_full() && peek() != id_string) {
      flip_card(parseInt(id_string));
      items.push(id_string);
      return true;
    } else {
      return false;
    }
  }

  function pop() {
    return items.pop();
  }

  function peek() {
    // 查看最上方的item
    if (!items.length) {
      // 要是堆疊為空，回傳空字串。
      return "";
    } else {
      return items[items.length - 1];
    }
  }

  function check_is_full() {
    if (items.length == 2) {
      return true;
    } else {
      return false;
    }
  }

  return {
    push,
    pop,
    peek,
    check_is_full,
  };
}

function shuffle_array(array) {
  // 洗圖順序
  // Fisher-Yates Shuffle 演算法
  // 將24張圖的資料洗亂，洗亂後，從0號牌到23號牌的圖組別、圖來源都會被排好，準備裝上牌。

  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }

  //  ====測試用 在console偷看答案====
  let answer = "";
  for (let i = 0; i < array.length; i++) {
    answer += array[i][0] + "\t";
    if (i % 6 == 5) {
      answer += "\n";
    }
  }
  console.clear();
  console.log(answer);
  //  ====測試用 在console偷看答案====
}

function photo_card_front_combine() {
  // 把圖裝上牌的前面(front)
  // 設定從0號牌到23號牌的圖組別、圖來源

  let fronts = document.querySelectorAll(".card .front");
  let index = 0;
  fronts.forEach((front) => {
    front.setAttribute("group", all_cards_data[index][0]);
    front.setAttribute("style", all_cards_data[index][1]);
    index++;
  });
}

function stack_initialize() {
  // 堆疊初始化
  stack = new Stack();
}

function try_matching(card_id_string) {
  // 先判斷要不要push進堆疊，有push才看堆疊滿了沒，滿了再判斷堆疊中的兩張卡的圖是否同組。
  if (stack.push(card_id_string)) {
    if (stack.check_is_full()) {
      let up_card_id = parseInt(stack.pop()); // 堆疊上方卡片ID(數字)
      let down_card_id = parseInt(stack.pop()); // 堆疊下方卡片ID(數字)

      if (all_cards_data[up_card_id][0] != all_cards_data[down_card_id][0]) {
        //  比對兩張卡的圖是否同組
        delay()
          .then(function () {
            $("#" + up_card_id).toggleClass("disabled");
            $("#" + down_card_id).toggleClass("disabled");
            return delay(1000); // 延遲ㄧ秒
          })
          .then(function () {
            // 配對失敗，取消翻開狀態 (變回蓋牌狀態)
            flip_card(up_card_id);
            flip_card(down_card_id);
            $("#" + up_card_id).toggleClass("disabled");
            $("#" + down_card_id).toggleClass("disabled");
          });
      } else {
        // 配對成功，隱藏(消掉)卡牌。
        $("#" + up_card_id).toggleClass("disabled");
        $("#" + down_card_id).toggleClass("disabled");
        hidden_card(up_card_id);
        hidden_card(down_card_id);
        unused_card_qty -= 2;
      }
    }
  }
}

function flip_card(card_id) {
  // 把牌翻開
  $("#" + card_id).toggleClass("flipped");
}

function hidden_card(card_id) {
  // 隱藏(消失)卡牌
  $("#" + card_id).toggleClass("hidden");
}

function startTimer() {
  seconds++;

  let seconds_units = seconds % 10;
  let seconds_tens = Math.floor(seconds / 10);

  if (seconds <= 59) {
    $("#seconds_units").text(seconds_units);
    $("#seconds_tens").text(seconds_tens);
  } else if (seconds == 60) {
    seconds = 0;
    $("#seconds_units").text("0");
    $("#seconds_tens").text("0");
    minutes++;
  }

  let minutes_units = minutes % 10;
  let minutes_tens = Math.floor(minutes / 10);

  if (minutes <= 59) {
    $("#minutes_units").text(minutes_units);
    $("#minutes_tens").text(minutes_tens);
  } else if (minutes == 60) {
    minutes = 0;
    $("#minutes_units").text("0");
    $("#minutes_tens").text("0");
  }
}

function closeWindow() {
  // 點擊X以關閉遊戲結束提示框
  $(".popup-wrap").fadeOut(200);
  $(".popup-box").removeClass("transform-in").addClass("transform-out");
  event.preventDefault();
}

function update_leaderboard() {
  // 讀取localstorage，載入歷史遊戲分數到分數排行榜陣列。(localstorage只存最好的四筆分數)
  // localstorage(0 ~ leaderboard_rows - 1) => leaderboard_data陣列(0 ~ leaderboard_rows) => leaderboard分數排行榜(0 ~ leaderboard_rows - 1)

  for (let i = 0; i < leaderboard_rows; i++) {
    let data = parseInt(localStorage.getItem(i));

    if (!data) {
      // 沒資料時把值設超大
      leaderboard_data[i] = 99999;
    } else {
      // 把第一名到第四名時間存進陣列，留待與此次分數比較排名。
      leaderboard_data[i] = data;
    }
  }
  // 此次分數先初始化為99999
  leaderboard_data[leaderboard_rows] = 99999;

  // 時間由少到多寫到分數排行榜上。
  for (let i = 0; i < leaderboard_rows; i++) {
    let score = leaderboard_data[i];
    if (score == 99999) {
      $("#score_" + i).text("");
    } else {
      let leaderboard_minutes = Math.floor(score / 60);
      let leaderboard_seconds = score % 60;
      if (leaderboard_minutes < 10) {
        leaderboard_minutes = "0" + leaderboard_minutes;
      }
      if (leaderboard_seconds < 10) {
        leaderboard_seconds = "0" + leaderboard_seconds;
      }
      $("#score_" + i).text(leaderboard_minutes + ":" + leaderboard_seconds);
    }
  }
}

function clear_history() {
  // 清除localstorage並更新分數排行榜
  localStorage.clear();
  update_leaderboard();
}

function opening_memory() {
  // 開幕(全翻牌，先讓玩家記五秒)
  delay()
    .then(function () {
      $(".card").toggleClass("flipped");
      return delay(5000); // 延遲五秒
    })
    .then(function () {
      // 配對失敗，取消翻開狀態 (變回蓋牌狀態)
      $(".card").toggleClass("flipped");
    });
}

// 設計給sort升冪用
function numberCompare(num1, num2) {
  return num1 - num2;
}

function game_prepare() {
  // 準備遊戲

  $("#restart_icon").toggleClass("disabled");

  // 洗圖順序
  shuffle_array(all_cards_data);

  // 把圖裝上牌的前面(front)
  photo_card_front_combine();

  // 堆疊初始化
  stack_initialize();

  // 讀取localstorage，載入歷史遊戲分數到分數排行榜陣列。(localstorage只存最好的四筆分數)
  // localstorage => leaderboard_data陣列 => leaderboard分數排行榜
  update_leaderboard();

  // enable計時器開關
  stopwatchStart = 0;

  // 計時器時間重置
  minutes = 0;
  seconds = 0;
  clearInterval(interval);
  $("#minutes_units").text("0");
  $("#minutes_tens").text("0");
  $("#seconds_units").text("0");
  $("#seconds_tens").text("0");

  // 重置卡牌(全卡牌禁止點擊、隱藏恢復、取消翻開)
  if ($(".card").hasClass("disabled")) {
    $(".card").removeClass("disabled");
  }
  $(".card").toggleClass("disabled");
  $(".card").removeClass("hidden");
  $(".card").removeClass("flipped");
  $("#start_icon").css("display", "flex");

  // 重置檯面上剩餘卡牌數量
  unused_card_qty = card_qty;
}

function game() {
  // 遊戲準備
  game_prepare();

  // 點擊start icon後遊戲開始
  $("#start_icon").on("click", function () {
    // 讓start icon消失
    $("#start_icon").css("display", "none");

    delay()
      .then(function () {
        // 開幕(全翻牌，先讓玩家記五秒)
        opening_memory();
        return delay(5000); // 延遲五秒才可點擊卡牌
      })
      .then(function () {
        $(".card").toggleClass("disabled");
        $("#restart_icon").toggleClass("disabled");
      });
  });

  // 點牌偵測
  $(".card").on("click", function () {
    // 從第一次翻牌開始計時 (只有第一次翻牌才觸動計時器開關)
    if (!stopwatchStart) {
      clearInterval(interval);
      interval = setInterval(startTimer, 1000);
      // disable計時器開關
      stopwatchStart = 1;
    }

    // 從被點擊卡牌元素抓出card id，送到stack，stack會決定要不要處理。
    try_matching(this["id"]);

    // 當全卡牌配對完畢：
    if (!unused_card_qty) {
      delay()
        .then(function () {
          clearInterval(interval);
          return delay(1000); // 延遲一秒再跳出遊戲結束提示框
        })
        .then(function () {
          // 跳出遊戲結束提示框
          $("#letmeopen").fadeIn(250);
          $("popup-box").removeClass("transform-out").addClass("transform-in");
          if (seconds < 10) {
            seconds = "0" + seconds;
          }
          if (minutes < 10) {
            minutes = "0" + minutes;
          }
          $("#endGamePopUpText").text("Your score: " + minutes + ":" + seconds);
          $(".popup-close").click(function () {
            closeWindow();
          });

          // 遊戲時間轉成總秒數，塞到leaderboard_data最後一格，排序後除了最後一格外，都送到localstorage儲存，並更新記分板。
          leaderboard_data[leaderboard_rows] =
            parseInt(minutes) * 60 + parseInt(seconds);
          
          // 判斷是否為新紀錄
          if (
            leaderboard_data[0] != 99999 &&
            leaderboard_data[leaderboard_rows] < leaderboard_data[0]
          ) {
            $("#endGamePopUpTitle").text("New Record!");
            $("#endGamePopUpTitle").css("color", "red");
          } else {
            $("#endGamePopUpTitle").text("Complete!");
            $("#endGamePopUpTitle").css("color", "#e9c46a");
          }
          leaderboard_data.sort(numberCompare);

          for (let i = 0; i < leaderboard_rows; i++) {
            localStorage.setItem(i, leaderboard_data[i]);
          }
          update_leaderboard();

          // 顯示finish文字
          $("#finish_text_1").text("Nice work!");
          $("#finish_text_2").text('Click the "New Game" icon to play again!');
        });
    }
  });

  // 點擊restart icon => 重新整理頁面
  $("#restart_icon").on("click", function () {
    $("#finish_text_1").text("");
    $("#finish_text_2").text("");
    game_prepare();
  });

  // 點擊broom icon => 清除歷史遊戲分數(localstorage)並更新分數排行榜
  $("#broom_icon").on("click", function () {
    clear_history();
  });

  /* 點擊bgm switch icon => 切換音樂播放 */
  $("#bgm_switch_icon").on("click", function () {
    let img_elem = document.getElementById("bgm_switch_img");
    let audio = document.getElementById("audio");
    if (img_elem.src.includes("bgm_switch_1")) {
      img_elem.src = "./img/bgm_switch_2.png";
      audio.play();
    } else {
      img_elem.src = "./img/bgm_switch_1.png";
      audio.pause();
    }
  });
}

$(document).ready(function () {
  game();
});
