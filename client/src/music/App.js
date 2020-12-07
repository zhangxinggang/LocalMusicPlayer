import React, { Component } from "react"
import axios from '@g/http.js'
import './main.scss'
import "./static/style.css";
class App extends Component {
  constructor(props) {
    super(props);
    this.state={
      // 是否暂停状态
      isPause: true,
      // 查询的关键字
      searchVal:'',
      // 当前音乐列表
      musicList: [],
      // 当前音乐
      currentMusic: {},
      // 进度条item是否可拖动
      processItemMove: false,
      // 当前的播放模式 1列表循环 2随机 3单曲
      playMode: 1,
      // 进度条item是否可拖动
      volumeProcessItemMove: false
    }
  }
  componentDidMount() {
    this.audioEvent()
    this.keyboardEvent()
  }
  // audio标签事件监听
  audioEvent(){
    const audio = this.audio
    audio.addEventListener("canplay", () => {
      //获取总时间
      const totalTime = parseInt(audio.duration);
      const {currentMusic} = this.state
      currentMusic.totalTime=this.getTime(totalTime)
      this.setState({
        currentMusic
      })
    })
    // 播放中添加时间变化监听
    audio.addEventListener("timeupdate", () => {
      const { processItemMove } = this.state;
      // 缓存对象
      const buffered = audio.buffered;
      // 当前缓存时间
      let bufferTime = 0;
      if (buffered.length !== 0) {
        bufferTime = buffered.end(buffered.length - 1);
      }
      // 当前缓存缓存宽度计算
      const width = this.progress.offsetWidth
      const bufferWidth = width * (bufferTime / audio.duration);
      // 当前播放宽度计算
      const playWidth = width * (audio.currentTime / audio.duration);
      // 如果正在拖动进度条的时候，不监听播放进度
      if (!processItemMove) {
        this.processPlayed.style.width = `${playWidth}px`;
        this.processItem.style.left = `${playWidth - 4}px`;
      }
      this.processBuffered.style.width = `${bufferWidth}px`;
    })

    // 当前音乐播放完毕监听
    audio.addEventListener("ended", () => {
      this.endedPlayMusic()
    });
  }
  // 秒转换-分:秒的格式
  getTime = time => {
    if (time) {
      const minute = parseInt((time / 60) % 60)
      const second = parseInt(time % 60)
      let minuteText = `${minute}`
      let secondText = `${second}`
      minute < 10 && (minuteText = `0${minute}`)
      second < 10 && (secondText = `0${second}`)
      return `${minuteText}:${secondText}`
    } else {
      return "00:00";
    }
  }
  // 播放
  onPlay = () => {
    this.setState({ isPause: false })
    this.audio.play()
  }
  // 暂停
  onPause = () => {
    this.setState({ isPause: true })
    this.audio.pause()
  }
  // 上一首
  previousMusic = () => {
    const { musicList,currentMusic } = this.state
    if (musicList.length > 0) {
      let currentIndex = musicList.findIndex(item => {
        return item.id === currentMusic.id;
      })
      currentIndex=currentIndex || musicList.length - 1
      this.setState({ currentMusic: musicList[currentIndex - 1] || musicList[musicList.length - 1]}, () => {
        this.onPlay()
      })
    }
  }
  // 下一首歌
  nextMusic = () => {
    const { musicList,currentMusic } = this.state
    if (musicList.length > 0) {
      let currentIndex = musicList.findIndex(item => {
        return item.id === currentMusic.id
      })
      currentIndex=currentIndex || 0
      this.setState({ currentMusic: musicList[currentIndex + 1] || musicList[0]}, () => {
        this.onPlay()
      })
    }
  }
  // 模式切歌
  endedPlayMusic = () => {
    const { playMode, currentMusic } = this.state;
    const { musicList } = this.state;
    if (musicList.length > 0 && currentMusic) {
      // 列表循环
      if (playMode === 1) {
        this.nextMusic()
      }
      // 列表随机
      else if (playMode === 2) {
        const randomIndex = Math.floor(Math.random() * musicList.length)
        if (musicList[randomIndex + 1]) {
          this.setState({ currentMusic: musicList[randomIndex + 1] }, () => {
            this.onPlay()
          })
        } else {
          this.setState({ currentMusic: musicList[0] }, () => {
            this.onPlay()
          })
        }
      }
      // 单曲循环
      else if (playMode === 3) {
        this.onPlay()
      }
    }
  }
  // 切歌
  onMusicListItemClick = id => {
    const { musicList,currentMusic } = this.state;
    const index = musicList.findIndex(item => {
      return item.id === id;
    });
    if (index !== -1) {
      // 当前播放的音乐和点击的音乐相同，则重置播放时间
      if (currentMusic.id === id) {
        this.onPlay()
      } else {
        this.setState({ currentMusic: musicList[index] }, () => {
          this.onPlay()
        });
      }
    }
  }
  // 监听按键事件
  keyboardEvent(){
    document.onkeydown=(e)=>{
      let keyCode = e.keyCode || e.which || e.charCode
      let ctrlKey = e.ctrlKey || e.metaKey
      if(ctrlKey && keyCode == 37){
        this.previousMusic()
      }else if(keyCode == 39){
        this.nextMusic()
      }else if(keyCode == 32){
        const {isPause} = this.state
        isPause?this.onPlay():this.onPause()
      }
    }
  }
  // 设置音乐播放模式
  onPlayModeChange = () => {
    const { playMode } = this.state
    this.setState({ playMode: playMode>2?1:(playMode+1)})
  }
  //查询
  onSearchChange = (e) =>{
    this.setState({
      searchVal:e.target.value
    })
  }
  componentWillMount(){
    axios.request({
      url:'/api-music/musicList',
      showConfig:true,
			method:'get',
    }).then(res=>{
      this.setState({
        musicList:res.data,
        currentMusic:res.data[0] || {}
      })
    })
  }
  render() {
    const {musicList,currentMusic,isPause,playMode,searchVal} = this.state
    let playModeIcon = "";
    switch (playMode) {
      case 1:
        playModeIcon = "icon-circulation-list";
        break;
      case 2:
        playModeIcon = "icon-circulation-random";
        break;
      case 3:
        playModeIcon = "icon-circulation-single";
        break;
      default:
        playModeIcon = "icon-circulation-list";
        break;
    }
    return (
      <div className="grid-container music">
        <div className="header music-head">
          <div className="music-head-title">
            <h4>
              播放列表(
              <span>
                {musicList && musicList.length ? musicList.length : 0}
              </span>
              )
            </h4>
          </div>
          <div className="music-head-search">
            <input type="text" placeholder="请输入查询的音乐名称" onChange={this.onSearchChange} />
          </div>
        </div>
        <div className="body music-body">
          <ul className="music-body-list">
            {musicList &&
              musicList.length > 0 &&
              musicList.map(item => {
                if(item.title.indexOf(searchVal)>-1){
                  return (
                    <li
                      key={item.id}
                      className={item.id==currentMusic.id?'music-body-list-current':''}
                      onClick={() => this.onMusicListItemClick(item.id)}
                    >
                      <div className="music-body-list-title">
                        {currentMusic.id == item.id && (
                          <span className="music-body-list-title-text icon-currentPlay music-body-list-cplay" />
                        )}
                        <span className="music-body-list-title-text">
                          {item.title}
                        </span>
                      </div>
                    </li>
                  )
                }
              })}
          </ul>
        </div>
        <div className="footer music-footer">
          <div className="left-controler">
            <span
              className="icon-prev left-controler-prev"
              onClick={this.previousMusic}
            />
            {isPause ? (
              <span className="icon-play left-controler-play" onClick={this.onPlay}/>
            ) : (
              <span className="icon-pause left-controler-play" onClick={this.onPause} />
            )}
            <span
              className="icon-next left-controler-next"
              onClick={this.nextMusic}
            />
          </div>
          <div className="main-controler">
            <div>
              <div className="main-controler-title">
                {currentMusic.title}
              </div>
              <div className="main-controler-progress">
                  <div 
                    className="progress"
                    ref={ref => (this.progress = ref)}
                  >
                    <div
                      className="progress-buffered"
                      ref={ref => (this.processBuffered = ref)}
                    />
                    <div
                      className="progress-played"
                      ref={ref => (this.processPlayed = ref)}
                    >
                      <div
                        className="progress-played-flag"
                        ref={ref => (this.processItem = ref)}
                      >
                        <div className="progress-played-flag-inside" />
                      </div>
                    </div>
                  </div>
              </div>
            </div>
            <div className="main-controler-ttime">
              {currentMusic.totalTime}
            </div>
            <div className="main-controler-mode">
              <span
                className={`${playModeIcon}`}
                onClick={this.onPlayModeChange}
              ></span>
            </div>
          </div>
          {/* 播放器基础组件 */}
          <audio src={currentMusic.url} ref={ref => (this.audio = ref)} />
        </div>
      </div>
    );
  }
}

export default App;
