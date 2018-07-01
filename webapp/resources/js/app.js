var app = angular.module("radar", []);

// Converts from degrees to radians.
Math.toRadians = function(degrees) {
    return degrees * Math.PI / 180;
  };
   
// Converts from radians to degrees.
Math.toDegrees = function(radians) {
    return radians * 180 / Math.PI;
};

var Calculo = {
    transformaPolar : function(x, y){
        let result = {r: 0, ang: 0};
        let v1 = Math.pow(x, 2); //Quadrado do x
        let v2 = Math.pow(y, 2); //Quadrado do y

        result.r = Math.sqrt(v1 + v2); // Raiz da soma dos quadrados = tenho o Raio(R² = x² + y²)

        result.ang = Math.toDegrees((Math.atan2(y, x))); //Arco tangente ou tangente inversa de y/x = tenho o Angulo (tg-1(m) = y/x)
        return result;
    },
    transformaCartesiano: function(r, ang){
        let result = {};
        result[x] = r * Math.cos(Math.toRadians(ang)); //x=R.cosX  ---  Math.toRadians - converte angulo de graus para o equivalente em radianos;
        result[y] = r * Math.sin(Math.toRadians(ang)); //y=R.senY
    },
    calculaRotacao: function(x, y, ang, xR, yR){
        let result = {};
        x -= xR;
        y -= yR;

        result[x] = x * Math.cos(Math.toRadians(ang)) - y * Math.sin(Math.toRadians(ang)); //x' = x * cos(B) - y * sen(B)
        result[y] = y * Math.cos(Math.toRadians(ang)) + x * Math.sin(Math.toRadians(ang)); //y' = y * cos(B) + x * sen(B)

        result[x] += xR;
        result[y] += yR;

        return result;
    },
    calculaEscala: function(x, y, Sx, Sy){
        let result = {};
        result[x] = x * (Sx / 100);
        result[y] = y * (Sy / 100);

        return result;
    },
    calculaTranslacao: function(x, y, Tx, Ty){
        let result = {};
        result[x] = x + Tx;
        result[y] = y + Ty;

        return result;
    },
    calculaDistanciaDoisPontos: function(x1, y1, x2, y2){
        let dist, dx, dy;

        dx = x2 - x1;
        dx = Math.pow(dx, 2);

        dy = y2 - y1;
        dy = Math.pow(dy, 2);

        dist = Math.sqrt(dx + dy);

        return dist;
    },
    calculaTempo: function(x1, y1, vel, x2, y2){
        let distancia = calculaDistanciaDoisPontos(x1, y1, x2, y2);
        return (distancia / vel) * 3600;
    },
    calculaInterseccao: function(x1, y1, dir1, x2, y2, dir2, ){
        let result = {};
        let angular1, angular2;
        let linear1, linear2;
        let X, Y;
        

        angular1 = this.calculaCoeficientAngular(dir1);
        angular2 = this.calculaCoeficientAngular(dir2);

        linear1 = this.calculaCoeficientLinear(angular1, x1, y1);
        linear2 = this.calculaCoeficientLinear(angular2, x2, y2);

        X = parseFloat((linear2 - (linear1))) / parseFloat((angular1 - angular2 ));

        Y = parseFloat(angular1 * X + linear1);

        var descolamento = this.calculaMovimento(x1, y1, dir1, 1, 1);
        var descolamento2 = this.calculaMovimento(x2, y2, dir2, 1, 1);
        aviao1_teste = false;
        aviao2_teste = false;

        if((X > x1 && descolamento.x > x1)){
            aviao1_teste = true;
        } else if((X < x1 && descolamento.x < x1)){
            aviao1_teste = true;
        } else if((Y > y1 && descolamento.y > y1)){
            aviao1_teste = true;
        } else if((Y < y1 && descolamento.y < y1)){
            aviao1_teste = true;
        }

        if((X > x2 && descolamento2.x > x2)){
            aviao2_teste = true;
        } else if((X < x2 && descolamento2.x < x2)){
            aviao2_teste = true;
        } else if((Y > y2 && descolamento2.y > y2)){
            aviao2_teste = true;
        } else if((Y < y2 && descolamento2.y < y2)){
            aviao2_teste = true;
        }

        if(aviao2_teste == true && aviao1_teste == true){
            return true;
        }

        return false;
    },
    calculaCoeficientAngular: function(angulo) {
        return Math.tan(Math.toRadians(angulo));
    },
    calculaCoeficientLinear: function(coeficienteAngular, x, y) {
        return ( y - coeficienteAngular * x);
    },
    calculaMovimento: function(x, y, direcao, velocidade, horas){
        resultado = {};
        hipotenusa = velocidade * horas;
        radianos =  Math.toRadians(direcao);
        diferenca_y = parseFloat(( Math.sin(radianos) * hipotenusa ).toFixed(14));
        diferenca_x = parseFloat(( Math.cos(radianos) * hipotenusa ).toFixed(14));
        y =  y + diferenca_y;
        x =  x + diferenca_x;
        return resultado = { y, x};
    }
}

function simular_func(param, callback){
    var voos = param.voos;
    var config = param.config;
    var resposta = { voos: [], notificacoes: []};
    voos.forEach(voo => {
        resultado_movimento = Calculo.calculaMovimento(voo.x, voo.y, voo.rotacao, voo.velocidade, 1);
        voo.x = resultado_movimento.x;
        voo.y = resultado_movimento.y;
        voo.distancia_aeroporto = Calculo.calculaDistanciaDoisPontos(voo.x, voo.y, 0, 0).toFixed(2);

        if(voo.distancia_aeroporto <= config.distancia_minima_aeroporto){
            resposta.notificacoes.push("O voo " + voo.numero + " está perto do aeroporto");
        }

        voos.forEach(vooB => {
            if(voo.numero != vooB.numero){
                if(Calculo.calculaDistanciaDoisPontos(voo.x, voo.y, vooB.x, vooB.y) <= config.distancia_minima_avioes){
                    resposta.notificacoes.push("O voo " + voo.numero + " está perto do voo " + vooB.numero);
                }
                if(voo.rotacao != vooB.rotacao){
                    if(Calculo.calculaInterseccao(voo.x, voo.y, voo.rotacao, vooB.x, vooB.y, vooB.rotacao)){
                        resposta.notificacoes.push("O voo " + voo.numero + " está em rota de colisão com o voo " + vooB.numero);
                    }
                }
            }
        });

        cordenada_polar = Calculo.transformaPolar(voo.x, voo.y);
        if( cordenada_polar != undefined){
            voo.coordenada_polar_r = cordenada_polar.r.toFixed(2);
            voo.coordenada_polar_ang = cordenada_polar.ang.toFixed(0);
        }
    });
    resposta.voos = voos;
    callback(resposta);
}

app.controller("main", function($scope){

    var air_trafic = document.createElement("AUDIO");
    air_trafic.src = "/public/sounds/air_traffic.mp3";
    air_trafic.loop = true;

    var sonar = document.createElement("AUDIO");
    sonar.src = "/public/sounds/sonar.mp3";
    sonar.loop = true;

    //torna ramdomico o momento em que o audio do trafico aereo irá iniciar
    setTimeout(()=>{
        air_trafic.currentTime = ( Math.random() * ( air_trafic.duration ));
    }, 1000);


    var button_click = document.createElement("AUDIO");
    button_click.src = "/public/sounds/Button_Press.mp3";

    $scope.tocarSomBotaoClick = function(){
        if(button_click.ended != true){
            button_click.pause();
            button_click.load();
        }
        button_click.play();
    }

    function logMouseMove(e) {
        e = e || window.event;	

        $scope.radar.dif_x =  $scope.radar.dif_x + ( ($scope.radar.init_x - e.clientX) / 4 );
        $scope.radar.dif_y =  $scope.radar.dif_y + ( ($scope.radar.init_y - e.clientY) / 4 );
        $scope.$apply();
    }



    $scope.iniciar_tracking_mouse_radar = function($event){
        $scope.radar.init_x = $event.clientX;
        $scope.radar.init_y = $event.clientY;
        window.onmousemove = logMouseMove;
    }

    $scope.parar_tracking_mouse_radar = function($event){
        $scope.radar.init_x = null;
        $scope.radar.init_y = null;
        window.onmousemove = null;
    }

    $scope.tirar_diferenca = function(rotacao){
        return ( ( parseInt(rotacao) ) ) + 90;
    }

    $scope.calc_x = function(x){
        return ( x + $scope.radar.dif_x);
    }

    $scope.calc_y = function(y){
        return ( y + $scope.radar.dif_y);
    }

    $scope.autor = "David Vitor Antonio";
    $scope.simulando = false;
    $scope.radar = { dif_x: 476, dif_y: 470 };
    $scope.voos = [];
    $scope.relatorio = [];
    $scope.watch
    $scope.cont = 1
    var voo_modelo = {numero: "V"+$scope.cont, x: 0, y: 0, rotacao: 0, velocidade: 0};
    $scope.voos.push(JSON.parse(JSON.stringify(voo_modelo)));

    $scope.adicionar_voo = function(){
        $scope.cont = $scope.cont + 1;
        voo_modelo.numero = "V" + $scope.cont;
        $scope.voos.push(JSON.parse(JSON.stringify(voo_modelo)));
        $scope.$apply();
        $scope.tocarSomBotaoClick();
    }

    $scope.limpar_relatorio = function(){
        $scope.relatorio = [];
        $scope.tocarSomBotaoClick()
    }

    $scope.config = { distancia_minima_aeroporto: 10, distancia_minima_avioes: 20 };
	
	$scope.rotina_de_atualizacao = function(){
		if($scope.simulando == true){
			simular_func({ voos: $scope.voos, config: $scope.config }, function(res){
				$scope.relatorio = res.notificacoes;
                $scope.voos = res.voos;
				console.log("resultado recebido");
				console.log(res);
                setTimeout($scope.rotina_de_atualizacao, 1000);
                $scope.$apply();
			});
		}
	}

    $scope.simular = function(){
        air_trafic.play();
        sonar.play();
        $scope.simulando = true;
		$scope.rotina_de_atualizacao();

    }

    $scope.parar_simular = function(){
        air_trafic.pause();
        sonar.pause();
        $scope.simulando = false;
    }
});