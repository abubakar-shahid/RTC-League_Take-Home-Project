let currentUser = "";
let intervalId = 0;
let ws;

//------------------------------------------------------------------------------------------
$(document).ready(function () {
    $(".section").hide();
    $(".logout").hide();

    $(".closeWindow").click(function () {
        $(".loginPage").hide();
        $(".signUpPage").hide();
    });
    //-----------------------------------------------------------------------------------------
    ws = new WebSocket('ws://localhost:8080');
    ws.onopen = function () {
        console.log('Connected to WebSocket server');
    };
    ws.onmessage = function (event) {
        const data = JSON.parse(event.data);
        if (data.type === 'loginResponse') {
            confirmLogin(data);
        } else if (data.type === 'signUpResponse') {
            confirmSignUp(data);
        } else if (data.type === 'error') {
            console.error('Error:', data.message);
        }
    };
    ws.onclose = function () {
        console.log('Disconnected from WebSocket server');
    };
    ws.onerror = function (error) {
        console.error('WebSocket encountered an error:', error);
    };
    window.addEventListener('beforeunload', function () {
        ws.close();
    });
    //-----------------------------------------------------------------------------------------
    $(".signUp").click(function () {
        $(".signUpPage").show();
    });

    $(".closeSignUp").click(function () {
        if ($(".signUpPassword").val() === $(".signUpConfirm").val()) {
            const userData = {
                type: 'createUser',
                data: {
                    username: $(".signUpUsername").val(),
                    email: $(".signUpEmail").val(),
                    password: $(".signUpPassword").val()
                }
            };
            ws.send(JSON.stringify(userData));
        } else {
            alert("Passwords do not match!");
        }
    });

    function confirmSignUp(user) {
        if (user.message === "200") {
            currentUser = user.username;
            $(".signUpUsername").val("");
            $(".signUpEmail").val("");
            $(".signUpPassword").val("");
            $(".signUpConfirm").val("");

            alert("SignUp Successful!")

            $(".signUpPage").hide();
            $(".login").hide();
            $(".signUp").hide();
            $(".noteClass").hide();

            $(".loggedUser").text("Logged-In as " + currentUser);
            $(".section").show();
            $(".logout").show();

            setBallPosition(0, 0, 0);
        } else {
            alert("Username or Email Already Exists!");
        }
    }
    //-----------------------------------------------------------------------------------------
    $(".login").click(function () {
        $(".loginPage").show();
    });

    $(".closeLogin").click(function () {
        const userData = {
            type: 'getUserInfo',
            data: {
                username: $(".loginUsername").val(),
                password: $(".loginPassword").val()
            }
        };
        ws.send(JSON.stringify(userData));
    });

    function confirmLogin(user) {
        console.log("in confirm login");
        console.log(user);
        if (user.message === "200") {
            currentUser = user.username;
            $(".loginUsername").val("");
            $(".loginPassword").val("");

            alert("Login Successful!")
            $(".loginPage").hide();
            $(".login").hide();
            $(".signUp").hide();
            $(".noteClass").hide();

            $(".loggedUser").text(`Logged-In as "`  + currentUser + `"`);
            $(".section").show();
            $(".logout").show();

            setBallPosition(parseFloat(user.x), parseFloat(user.y), parseFloat(user.z));
        } else {
            alert(user.message + ": User not Found!");
        }
    }
    //-----------------------------------------------------------------------------------------
    $(".logout").click(function () {
        clearInterval(intervalId);
        saveBallPositions();
        currentUser = "";

        alert("User Logged Out Successfully!")
        $(".section").hide();
        $(".logout").hide();

        $(".loggedUser").text("User not Logged-In Yet!")
        $(".login").show();
        $(".signUp").show();
        $(".noteClass").show();
    });
});

function saveBallPositions() {
    const ballPositions = {
        type: 'saveState',
        data: {
            username: currentUser,
            x: ball.position.x,
            y: ball.position.y,
            z: ball.position.z,
        }
    };
    alert("State Saved as: " + ball.position.x + ", " + ball.position.y + "," + ball.position.z);
    ws.send(JSON.stringify(ballPositions));
}

//-------------------------------------------------------------------------------------------

const scene = new THREE.Scene();

const renderer = new THREE.WebGLRenderer();
renderer.setSize(1350, 535);
document.getElementById("section").appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.z = 5;

const canvas = document.createElement('canvas');
canvas.width = 512;
canvas.height = 512;

const context = canvas.getContext('2d');
context.fillStyle = 'blue';
context.fillRect(0, 0, canvas.width, canvas.height);
context.font = '48px Arial';
context.fillStyle = 'white';
context.textAlign = 'center';
context.fillText('-------------------------------------------', canvas.width / 3, canvas.height / 1.2);
context.fillText('-------------------------------------------', canvas.width / 3, canvas.height / 1.5);
context.fillText('-------------------------------------------', canvas.width / 3, canvas.height / 2);
context.fillText('-------------------------------------------', canvas.width / 3, canvas.height / 3);
context.fillText('-------------------------------------------', canvas.width / 3, canvas.height / 5);

const texture = new THREE.CanvasTexture(canvas);

const material = new THREE.MeshPhongMaterial({ map: texture, shininess: 100 });

const geometry = new THREE.SphereGeometry(1, 32, 32);

const ball = new THREE.Mesh(geometry, material);
scene.add(ball);

const light = new THREE.PointLight(0xffffff, 1, 100);
light.position.set(10, 10, 10);
scene.add(light);

const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

function moveBallRandomly() {
    ball.position.x = (Math.random() - 0.5) * 4;
    ball.position.y = (Math.random() - 0.5) * 3;
    ball.position.z = (Math.random() - 0.5) * 3;
    saveBallPositions();
}

function animate() {
    requestAnimationFrame(animate);
    ball.rotation.x += 0.01;
    ball.rotation.y += 0.01;
    ball.rotation.z += 0.01;
    renderer.render(scene, camera);
}
animate();

function setBallPosition(x, y, z) {
    ball.position.x = x;
    ball.position.y = y;
    ball.position.z = z;
    alert(ball.position.x + ", " + ball.position.y + ", " + ball.position.z);
    intervalId = setInterval(moveBallRandomly, 5000);
}
