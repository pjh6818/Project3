var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var session = require('express-session');
var async = require('async');

// MySQL 로드
var mysql = require('mysql');
var pool = mysql.createPool({
	connectionLimit: 5,
	host: 'malid.cgvtbxiixr2x.ap-northeast-2.rds.amazonaws.com',
	user: 'MALID',
	database: 'SE',
	password: '1234qwer'
});

router.get('/', function(req, res) {
  console.log(req.query.page);
  var CurrPage  = Number(req.query.page);   // 현재 페이지 인덱스
  if(!CurrPage)CurrPage = 1;
	var TotalPage;  // 총 페이지 수
	var articles = "";     // 게시판 내용
  var pageArticleNum = 20; // 한 페이지에 표시될 게시글의 개수
  var pageListNum = 10;  // 한 화면에 표시될 페이지 인덱스의 수
  var startPage;  // 현재 화면 시작 인덱스
  var endPage;    // 현재 화면 끝 인덱스
  var Articles;
	async.waterfall([
	  function(callback){
      pool.getConnection(function (err, connection) {
        var sql = "SELECT COUNT(*) AS count FROM board1";
        connection.query(sql, function(err, result){
          if(err) console.error(err);
          TotalPage = Math.ceil(result[0].count / pageArticleNum);
          connection.release();
          callback(null, TotalPage);
        });
      });
    },
    function(totalpage, callback){
       pool.getConnection(function (err, connection) {
        var sql = "SELECT idx, title, date, creator FROM board1";
        connection.query(sql, function(err, result){
          if(err) console.error(err);
          articles = result;
          var temp = {
            articles: articles,
            total: totalpage
          }
          connection.release();
          callback(null, temp);
        });
      });
    },
    function(data, callback){
      // 현재 페이지의 페이지네이션 시작 번호
      startPage = ((Math.ceil(CurrPage/pageArticleNum) - 1) * pageArticleNum) + 1;
      // 현재 페이지의 페이지네이션 끝 번호
      endPage = (startPage + pageArticleNum) - 1;
        // 만약 현재 페이지네이션 끝 번호가 페이지네이션 전체 카운트보다 높을 경우
        if(endPage > TotalPage){
          endPage = TotalPage;
        }
        Articles = {
          contents: data.articles,
          Current: CurrPage,
          Start: startPage,
          End: endPage,
          Total: data.total,
          ListCount: pageListNum
        };
        console.log(Articles.contents);
        callback(null, Articles);
      }
  ],function(err, Articles){
      if (err) {
        throw err;
      } else {
        res.render('notice',{
          title: 'notice',
          articles: Articles,
            username:req.session.username
        });
        console.log(Articles);
      }
    }
  );
});

module.exports = router;