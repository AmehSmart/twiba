import { tweetsData as defaultTweetsData } from './data.js'
import { v4 as uuidv4 } from 'https://jspm.dev/uuid';

const STORAGE_KEY = 'twitterCloneData'  
const savedTweets = JSON.parse(localStorage.getItem(STORAGE_KEY))
let tweetsData = savedTweets && savedTweets.length > 0
    ? savedTweets
    : defaultTweetsData

function saveToLocalStorage(){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tweetsData))
}
document.addEventListener('click', function(e){
    if(e.target.dataset.like){
       handleLikeClick(e.target.dataset.like) 
    }
    else if(e.target.dataset.retweet){
        handleRetweetClick(e.target.dataset.retweet)
    }
    else if(e.target.dataset.reply){
        handleReplyClick(e.target.dataset.reply)
    } else if(e.target.dataset.delete){
        handleDeleteClick(e.target.dataset.delete)
    }
    else if(e.target.id === 'tweet-btn'){
        handleTweetBtnClick()
    }
    saveToLocalStorage()
})
 
function handleLikeClick(tweetId){ 
    const targetTweetObj = tweetsData.filter(function(tweet){
        return tweet.uuid === tweetId
    })[0]

    if (targetTweetObj.isLiked){
        targetTweetObj.likes--
    }
    else{
        targetTweetObj.likes++ 
    }
    targetTweetObj.isLiked = !targetTweetObj.isLiked
     saveToLocalStorage()
    render()
}

function handleRetweetClick(tweetId){
    const targetTweetObj = tweetsData.filter(function(tweet){
        return tweet.uuid === tweetId
    })[0]
    
    if(targetTweetObj.isRetweeted){
        targetTweetObj.retweets--
    }
    else{
        targetTweetObj.retweets++
        tweetsData.unshift({
            handle: targetTweetObj.handle,
            profilePic: targetTweetObj.profilePic,
            likes: 0,
            retweets: 0,
            tweetText: targetTweetObj.tweetText,
            replies: [],
            isLiked: false,
            isRetweeted: false,
            isMine: true,
            uuid: uuidv4()
        })
    }
    targetTweetObj.isRetweeted = !targetTweetObj.isRetweeted
    saveToLocalStorage()
    render() 
}

function handleReplyClick(replyId){
    document.getElementById(`replies-${replyId}`).classList.toggle('hidden')

        const replyInput = document.getElementById(`reply-input-${replyId}`)
        const sendReplyBtn = document.querySelector(`#replies-${replyId} .fa-paper-plane`)

        sendReplyBtn.addEventListener('click', function(){
            if(replyInput.value){
                const targetTweetObj = tweetsData.filter(function(tweet){
                    return tweet.uuid === replyId
                })[0]
                
                targetTweetObj.replies.unshift({
                    handle: `@Scrimba`,
                    profilePic: `images/scrimbalogo.png`,
                    tweetText: replyInput.value,
                    isMine: true
                })
                saveToLocalStorage()
                render()
            }
        })

}

function handleTweetBtnClick(){
    const tweetInput = document.getElementById('tweet-input')

    if(tweetInput.value){
        tweetsData.unshift({
            handle: `@Scrimba`,
            profilePic: `images/scrimbalogo.png`,
            likes: 0,
            retweets: 0,
            tweetText: tweetInput.value,
            replies: [],
            isLiked: false,
            isRetweeted: false,
            isMine: true,
            uuid: uuidv4()
        })
    saveToLocalStorage()
    render()
    tweetInput.value = ''
    }

}
function handleDeleteClick(tweetId){
    tweetsData = tweetsData.filter(function(tweet){
        //“Keep every tweet whose uuid is NOT equal to the clicked tweet. If the uuid matches, it means that tweet is the one we want to delete, so we won't keep it in the new array.”
        return tweet.uuid !== tweetId
        // here i am returning all the tweets except the one with the id that was passed in as an argument to the function
    })
    saveToLocalStorage()
    render()
}

function getFeedHtml(){

    let feedHtml = ``
    
    tweetsData.forEach(function(tweet){
        
        let likeIconClass = ''
        
        if (tweet.isLiked){
            likeIconClass = 'liked'
        }
        
        let retweetIconClass = ''
        
        if (tweet.isRetweeted){
            retweetIconClass = 'retweeted'
        }
        
        let repliesHtml = ''
        
        if(tweet.replies.length > 0){
            tweet.replies.forEach(function(reply){
                repliesHtml+=`
<div class="tweet-reply">
    <div class="tweet-inner">
        <img src="${reply.profilePic}" class="profile-pic">
            <div>
                <p class="handle">${reply.handle}</p>
                <p class="tweet-text">${reply.tweetText}</p>
            </div>
        </div>
</div>
`
            })
        }
        
    let deleteBtn = ''
    if(tweet.isMine){
    deleteBtn = `
    <span class="tweet-detail">
        <i class="fa-solid fa-trash"
        data-delete="${tweet.uuid}">
        </i>
    </span>
    `
}
          
        feedHtml += `
<div class="tweet">
    <div class="tweet-inner">
        <img src="${tweet.profilePic}" class="profile-pic">
        <div>
            <p class="handle">${tweet.handle}</p>
            
            <p class="tweet-text">${tweet.tweetText}</p>
            <div class="tweet-details">
                <span class="tweet-detail">
                    <i class="fa-regular fa-comment-dots"
                    data-reply="${tweet.uuid}"
                    ></i>
                    ${tweet.replies.length}
                </span>
                <span class="tweet-detail">
                    <i class="fa-solid fa-heart ${likeIconClass}"
                    data-like="${tweet.uuid}"
                    ></i>
                    ${tweet.likes}
                </span>
                <span class="tweet-detail">
                    <i class="fa-solid fa-retweet ${retweetIconClass}"
                    data-retweet="${tweet.uuid}"
                    ></i>
                    ${tweet.retweets}
                </span>


            <span >
              ${deleteBtn}
            </span>

            </div>   
            
        </div>            
    </div>
    <div class="hidden" id="replies-${tweet.uuid}">
        ${repliesHtml}
        <textarea placeholder="Tweet your reply" class="reply-input" id="reply-input-${tweet.uuid}"></textarea>
        <i class="fa fa-paper-plane" aria-hidden="true"></i>   
 </div>   
</div>
`
   })
   return feedHtml 
   
}

function render(){
    document.getElementById('feed').innerHTML = getFeedHtml()
}

render()

