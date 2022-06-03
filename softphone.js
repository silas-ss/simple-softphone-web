let session;
let coolPhone;
$(function () {
  function initEventHandlers() {
    coolPhone.on("registered", function (e) {
      $("#register").hide();
      $("#unregister").show();
      $("#panel_control").show();
      console.log("registered");
    });
    coolPhone.on("unregistered", function (e) {
      $("#register").show();
      $("#unregister").hide();
      $("#panel_control").hide();
      console.log("unregistered");
    });
    coolPhone.on("registrationFailed", function (e) {
      console.error("error on register");
    });
    coolPhone.on("newRTCSession", function (e) {
      console.log("incoming call", e);
      session = e.session;

      $("#number_call").html(
        `<strong>${session.remote_identity.uri.user}</strong>`
      );
      $("#new_call").show();
      if (e.originator == "remote") {
        $("#answer").show();
        $("#hangup").show();
      } else if (e.originator == "local") {
        $("#answer").hide();
        $("#hangup").show();
      }

      session.on("ended", () => {
        console.log("terminated");
        $("#new_call").hide();
      });

      session.on("accepted", () => {
        $("#answer").hide();
      });
    });
    coolPhone.on("newMessage", function (e) {
      console.log("message", e);
    });
  }

  function register() {
    const server = $("#server").val();
    const user = $("#user").val();
    const password = $("#password").val();
    const socket = new JsSIP.WebSocketInterface(`wss://${server}:8089/ws`);
    const configuration = {
      sockets: [socket],
      uri: `sip:${user}@${server}`,
      contact_uri: `sip:${user}@${server}`,
      password,
    };
    coolPhone = new JsSIP.UA(configuration);
    coolPhone.start();
    initEventHandlers();
    $("#config").hide();
  }

  function unregister() {
    coolPhone.stop();
  }

  function call() {
    const phone = $("#number").val();
    var eventHandlers = {
      progress: function (e) {
        console.log("call is in progress");
      },
      failed: function (e) {
        console.log("call failed with cause: " + e.data);
      },
      ended: function (e) {
        console.log("call ended with cause: " + e.data);
      },
      confirmed: function (e) {
        console.log("call confirmed");
      },
    };

    var options = {
      eventHandlers: eventHandlers,
      mediaConstraints: { audio: true, video: true },
    };

    var session = coolPhone.call(`sip:${phone}@localhost`, options);
  }

  $("#unregister").click(() => {
    unregister();
  });

  $("#register").click(() => {
    register();
  });

  $("#call").click((e) => {
    call();
  });

  $("#answer").click(() => {
    session.answer();
  });

  $("#hangup").click(() => {
    session.terminate();
    $("#new_call").hide();
  });
});
