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
        
        if( result.ang < 0 || result.ang > 359 ){
            result.ang = 359 + ( result.ang + 1 );
        }
        return result;
    },
    transformaCartesiano: function(r, ang){
        let result = {x: 0, y: 0};
        result.x = r * Math.cos(Math.toRadians(ang)); //x=R.cosX  ---  Math.toRadians - converte angulo de graus para o equivalente em radianos;
        result.y = r * Math.sin(Math.toRadians(ang)); //y=R.senY
        return result;
    },
    calculaRotacao: function(x, y, ang, xR, yR){
        let result = {};
        //x -= xR;
        //y -= yR;

        result.x = x * Math.cos(Math.toRadians(ang).toFixed(15)) - y * Math.sin(Math.toRadians(ang).toFixed(15)).toFixed(15); //x' = x * cos(B) - y * sen(B)
        result.y = y * Math.cos(Math.toRadians(ang).toFixed(15)) + x * Math.sin(Math.toRadians(ang).toFixed(15)).toFixed(15); //y' = y * cos(B) + x * sen(B)

        //result.x += xR;
        //result.y += yR;

        return result;
    },
    calculaEscala: function(x, y, Sx, Sy){
        let result = {};
        result.x = x * (Sx / 100);
        result.y = y * (Sy / 100);

        return result;
    },
    calculaTranslacao: function(x, y, Tx, Ty){
        let result = {};
        result.x = x + Tx;
        result.y = y + Ty;

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
    calculaMovimento: function(x, y, direcao, velocidade, segundos){
        resultado = {};
        hipotenusa = ( ( velocidade / 60 ) / 60 ) * segundos;
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
    var static = param.static;
    var resposta = { voos: [], notificacoes: []};
    voos.forEach(voo => {
        //calcula 1 segundo
        if(static != true){
            resultado_movimento = Calculo.calculaMovimento(voo.x, voo.y, voo.rotacao, voo.velocidade, config.proporcao_tempo);
        } else {
            resultado_movimento = Calculo.calculaMovimento(voo.x, voo.y, voo.rotacao, voo.velocidade, 0);
        }
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
            voo.raio_polar = cordenada_polar.r.toFixed(2);
            voo.angulo_polar = cordenada_polar.ang.toFixed(0);
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
        var temp_x = $scope.radar.dif_x + ( ($scope.radar.init_x - e.clientX) / 4 );
        var temp_y = $scope.radar.dif_y + ( ($scope.radar.init_y - e.clientY) / 4 );
        if(temp_x < 5000 && temp_x > -5000){
            $scope.radar.dif_x =  temp_x;
        }
        if(temp_y < 5000 && temp_y > -5000){
            $scope.radar.dif_y =  temp_y;
        }
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
        return ( ( x * 10 ) + $scope.radar.dif_x);
    }

    $scope.calc_y = function(y){
        return ( ( y * 10 ) + $scope.radar.dif_y);
    }

    $scope.monitor_1_view = 1;
    $scope.monitor_13_view = 0;
    $scope.mensagem = { texto: "", view_salvo: 1, enviar: null}
    $scope.autor = "David Vitor Antonio";
    $scope.simulando = false;
    $scope.radar = { dif_x_c: 485.5, dif_x: 485.5, dif_y_c: 479, dif_y: 479 };
    $scope.voos = [];
    $scope.relatorio = [];
    $scope.cont = 1;
    $scope.alterar_voos = { x: 0, y: 0, angulo_polar: 0, raio_polar: 0 , graus: 0, escala_x: 100, escala_y: 100 };
    var voo_modelo = {numero: "V"+$scope.cont, x: 10, y: 0, angulo_polar: 0, raio_polar: 10 , rotacao: 0, velocidade: 10};
    $scope.voo_add = JSON.parse(JSON.stringify(voo_modelo));
    $scope.voos.push(JSON.parse(JSON.stringify(voo_modelo)));

    $scope.$watchGroup(['alterar_voos.x', 'alterar_voos.y'], function(a,b,c) {
        if($scope.alterar_voos.mudou != true){
            var resultado =  Calculo.transformaPolar($scope.alterar_voos.x, $scope.alterar_voos.y);
            $scope.alterar_voos.angulo_polar = resultado.ang;
            $scope.alterar_voos.raio_polar = resultado.r;
            $scope.alterar_voos.mudou = true;
        } else {
            $scope.alterar_voos.mudou = false;
        }
    });

    $scope.$watchGroup(['alterar_voos.angulo_polar', 'alterar_voos.raio_polar'], function(a,b,c) {
        if($scope.alterar_voos.mudou != true){
            var resultado =  Calculo.transformaCartesiano($scope.alterar_voos.raio_polar, $scope.alterar_voos.angulo_polar);
            $scope.alterar_voos.x = resultado.x;
            $scope.alterar_voos.y = resultado.y;
            $scope.alterar_voos.mudou = true;
        } else {
            $scope.alterar_voos.mudou = false;
        }
    });

    $scope.$watchGroup(['voo_add.x', 'voo_add.y'], function(a,b,c) {
        if($scope.voo_add.mudou != true){
            var resultado =  Calculo.transformaPolar($scope.voo_add.x, $scope.voo_add.y);
            $scope.voo_add.angulo_polar = resultado.ang;
            $scope.voo_add.raio_polar = resultado.r;
            $scope.voo_add.mudou = true;
        } else {
            $scope.voo_add.mudou = false;
        }
    });

    $scope.$watchGroup(['voo_add.angulo_polar', 'voo_add.raio_polar'], function(a,b,c) {
        if($scope.voo_add.mudou != true){
            var resultado =  Calculo.transformaCartesiano($scope.voo_add.raio_polar, $scope.voo_add.angulo_polar);
            $scope.voo_add.x = resultado.x;
            $scope.voo_add.y = resultado.y;
            $scope.voo_add.mudou = true;
        } else {
            $scope.voo_add.mudou = false;
        }
    });

    $scope.$watch('voos', function(a,b,c) {
        if( $scope.simulando != true ){
            simular_func({ voos: $scope.voos, config: $scope.config, static: true }, function(res){
				$scope.relatorio = res.notificacoes;
                $scope.voos = res.voos;
                $scope.$apply();
			});
        }
    }, true);

    $scope.mensagem.enviar = function(mensagem){
        $scope.mensagem.view_salvo = $scope.monitor_1_view;
        $scope.mensagem.texto = mensagem;
        $scope.monitor_1_view = 0;
    }

    $scope.mensagem.confirmar_mensagem = function(){
        $scope.monitor_1_view = $scope.mensagem.view_salvo;
        $scope.tocarSomBotaoClick();
    }

    $scope.change_monitor_view = function(changes){
        changes.forEach(function(change){
            $scope['monitor_'+ change[0] +'_view'] = change[1];
        });
        $scope.tocarSomBotaoClick();
    }

    $scope.adicionar_voo = function(){
        if($scope.voos.findIndex(function(voo){ return ( voo.numero == $scope.voo_add.numero) })  == -1){
            $scope.voos.push($scope.voo_add);
            $scope.cont = $scope.cont + 1;
            voo_modelo.numero = "V" + $scope.cont;
            $scope.voo_add = JSON.parse(JSON.stringify(voo_modelo));
            $scope.$apply();
            $scope.tocarSomBotaoClick();
        } else {
            $scope.mensagem.enviar("Já existe um voo com o numero " + $scope.voo_add.numero)
        }
    }

    $scope.localizar_voo = function(voo_index){
        $scope.radar.dif_x = $scope.radar.dif_x_c - ( $scope.voos[voo_index].x * 10).toFixed(1);
        $scope.radar.dif_y = $scope.radar.dif_y_c - ( $scope.voos[voo_index].y * 10).toFixed(1);
        $scope.$apply();
    }

    $scope.confirmar_translacao = function(){
        $scope.voos.forEach(function(voo){
            if(voo.selecionado){
                var resultado = Calculo.calculaTranslacao(voo.x, voo.y, $scope.alterar_voos.x, $scope.alterar_voos.y);
                voo.x = resultado.x;
                voo.y = resultado.y;
            }
        })
    }

    $scope.confirmar_rotacao = function(){
        if($scope.alterar_voos.graus == undefined){
            $scope.mensagem.enviar("O angulo deverá estar entre 0 e 359");
            return;
        } else {
            $scope.voos.forEach(function(voo){
                if(voo.selecionado){
                    var resultado = Calculo.calculaRotacao(voo.x, voo.y, $scope.alterar_voos.graus);
                    voo.x = resultado.x;
                    voo.y = resultado.y;
                }
            })
        }
        
    }

    $scope.confirmar_escalonamento = function(){
        $scope.voos.forEach(function(voo){
            if(voo.selecionado){
                var resultado = Calculo.calculaEscala(voo.x, voo.y, $scope.alterar_voos.escala_x, $scope.alterar_voos.escala_y);
                voo.x = resultado.x;
                voo.y = resultado.y;
            }
        })
    }

    $scope.limpar_relatorio = function(){
        $scope.relatorio = [];
        $scope.tocarSomBotaoClick()
    }

    $scope.config = { distancia_minima_aeroporto: 10, distancia_minima_avioes: 20, proporcao_tempo: 1 };
	
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