/**
 * @name handleFail
 * @param err - error thrown by any function
 * @description Helper function to handle errors
 */
// let handleFail = function (err) {
//   console.log("Error : ", err);
// };

// Queries the container in which the remote feeds belong
// let remoteContainer = document.getElementById("remote-container");
// let canvasContainer = document.getElementById("canvas-container");
/**
 * @name addVideoStream
 * @param streamId
 * @description Helper function to add the video stream to "remote-container"
 */
// function addVideoStream(streamId) {
//   let streamDiv = document.createElement("div"); // Create a new div for every stream
//   streamDiv.id = streamId; // Assigning id to div
//   streamDiv.style.transform = "rotateY(180deg)"; // Takes care of lateral inversion (mirror image)
//   remoteContainer.appendChild(streamDiv); // Add new div to container
// }
/**
 * @name removeVideoStream
 * @param evt - Remove event
 * @description Helper function to remove the video stream from "remote-container"
 */
// function removeVideoStream(evt) {
//   let stream = evt.stream;
//   stream.stop();
//   let remDiv = document.getElementById(stream.getId());
//   remDiv.parentNode.removeChild(remDiv);
//   console.log("Remote stream is removed " + stream.getId());
// }

// function addCanvas(streamId) {
//   let canvas = document.createElement("canvas");
//   canvas.id = "canvas" + streamId;
//   canvasContainer.appendChild(canvas);
//   let ctx = canvas.getContext("2d");
//   let video = document.getElementById(`video${streamId}`);

//   video.addEventListener("loadedmetadata", function () {
//     canvas.width = video.videoWidth;
//     canvas.height = video.videoHeight;
//   });

//   video.addEventListener(
//     "play",
//     function () {
//       var $this = this; //cache
//       (function loop() {
//         if (!$this.paused && !$this.ended) {
//           ctx.drawImage($this, 0, 0);
//           setTimeout(loop, 1000 / 30); // drawing at 30fps
//         }
//       })();
//     },
//     0
//   );
// }

var rtc = {
  client: null,
  joined: false,
  published: false,
  localStream: null,
  remoteStreams: [],
  params: {},
};

var option = {
  appID: "de94b2bb7d2b4657949186c20f531eee",
  channel: "AgoraChat",
  uid: null,
  token:
    "006de94b2bb7d2b4657949186c20f531eeeIADiLLMoGmP1r6LJMVumMEQF/Gc/MbmX/3Y5zt+J/e43afvmY44AAAAAEAC+3ac7veAZXwEAAQC/4Blf",
};

rtc.client = AgoraRTC.createClient({ mode: "rtc", codec: "h264" });

// Initialize the client
rtc.client.init(
  option.appID,
  function () {
    console.log("init success");
  },
  (err) => {
    console.error(err);
  }
);
// Client Setup
// Defines a client for RTC
// let client = AgoraRTC.createClient({
//   mode: "live",
//   codec: "h264",
// });

// Client Setup
// Defines a client for Real Time Communication
// client.init(
//   "de94b2bb7d2b4657949186c20f531eee",
//   () => console.log("AgoraRTC client initialized"),
//   handleFail
// );

// The client joins the channel
rtc.client.join(
  option.token,
  option.channel,
  option.uid,
  function (uid) {
    console.log("join channel: " + option.channel + " success, uid: " + uid);
    rtc.params.uid = uid;
  },
  function (err) {
    console.error("client join failed", err);
  }
);

rtc.localStream = AgoraRTC.createStream({
  streamID: rtc.params.uid,
  audio: true,
  video: true,
  screen: false,
});

// Initialize the local stream
rtc.localStream.init(
  function () {
    console.log("init local stream success");
    // play stream with html element id "local_stream"
    rtc.localStream.play("local_stream");
  },
  function (err) {
    console.error("init local stream failed ", err);
  }
);

rtc.client.publish(rtc.localStream, function (err) {
  console.log("publish failed");
  console.error(err);
});

rtc.client.on("stream-added", function (evt) {
  var remoteStream = evt.stream;
  var id = remoteStream.getId();
  if (id !== rtc.params.uid) {
    rtc.client.subscribe(remoteStream, function (err) {
      console.log("stream subscribe failed", err);
    });
  }
  console.log("stream-added remote-uid: ", id);
});

rtc.client.on("stream-removed", function (evt) {
  var remoteStream = evt.stream;
  var id = remoteStream.getId();
  // Stop playing the remote stream.
  remoteStream.stop("remote_video_" + id);
  // Remove the view of the remote stream.
  removeView(id);
  console.log("stream-removed remote-uid: ", id);
});

rtc.client.leave(
  function () {
    // Stop playing the local stream
    rtc.localStream.stop();
    // Close the local stream
    rtc.localStream.close();
    // Stop playing the remote streams and remove the views
    while (rtc.remoteStreams.length > 0) {
      var stream = rtc.remoteStreams.shift();
      var id = stream.getId();
      stream.stop();
      removeView(id);
    }
    console.log("client leaves channel success");
  },
  function (err) {
    console.log("channel leave failed");
    console.error(err);
  }
);

//When a stream is added to a channel
// client.on("stream-added", function (evt) {
//   client.subscribe(evt.stream, handleFail);
// });
//When you subscribe to a stream
// client.on("stream-subscribed", function (evt) {
//   let stream = evt.stream;
//   addVideoStream(stream.getId());
//   stream.play(stream.getId());
//   addCanvas(stream.getId());
// });
//When a person is removed from the stream
// client.on("stream-removed", removeVideoStream);
// client.on("peer-leave", removeVideoStream);
