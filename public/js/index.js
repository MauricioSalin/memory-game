// Variaveis globais
var firstTile = null;
var secondTile = null;
var canPick = true;

// Cria a cena
var stage = new PIXI.Stage(0xececec0);
var renderer = PIXI.autoDetectRenderer(900, 900, null, true);

// Cria um container
var gameContainer = new PIXI.DisplayObjectContainer();

// Adiciona container na cena
stage.addChild(gameContainer);
document.body.appendChild(renderer.view);

// Carrega o sprite sheet
var tileAtlas = ["assets/images.json"];
var loader = new PIXI.AssetLoader(tileAtlas);

// Inicia a aplicação
loader.onComplete = startMenu
loader.load();

// Função para criar o botão iniciar
const renderStart = () => {

	// Cria um item do tipo texto
	var jogar = new PIXI.Text('INICIAR', {
		font: '100px Impact',
		fill: '#ffffff'
	});

	// Define a posição
	jogar.x = 300;
	jogar.y = 700;

	// Torna item interativo para receber ações
	jogar.buttonMode = true;
	jogar.interactive = true;

	mouseHover(jogar);
	jogar.mousedown = jogar.touchstart = loadGame;

	gameContainer.addChild(jogar);
}

// efeito de hover
const mouseHover = (child) => {
	child.mouseover = function (mouseData) {
		this.alpha = 0.8;
	}

	child.mouseout = function (mouseData) {
		this.alpha = 1;
	}
}

// renderiza menu inicial
function startMenu() {
	var header = new PIXI.Text('Computação gráfica', {
		font: '40px Impact',
		fill: '#16525a'
	});

	header.x = 280;
	header.y = 50;

	var title = new PIXI.Text('JOGO DA MEMÓRIA', {
		font: '80px Impact',
		fill: '#16525a',
	});

	title.x = 170;
	title.y = 325;

	// adiciona na cena
	gameContainer.addChild(header);
	gameContainer.addChild(title);

	renderStart();
	requestAnimFrame(animate);
}

const playAgain = (oldTime) => {
	// diferença do tempo entre o inicio do jogo e o final
	let gameTime = Math.abs(new Date() - oldTime) / 1000;

	var timeTitle = new PIXI.Text('Seu tempo:', {
		font: '50px Impact',
		fill: '#16525a'
	});

	timeTitle.x = 270;
	timeTitle.y = 250;

	var timeStr = new PIXI.Text(`${gameTime.toFixed(2)}s`, {
		font: '50px Impact',
		fill: '#23666e'
	});

	timeStr.x = 510;
	timeStr.y = 250;

	// adiciona na cena
	gameContainer.addChild(timeTitle);
	gameContainer.addChild(timeStr);

	renderStart();
	requestAnimFrame(animate);
}

const loadGame = () => {
	// hora que o jogo foi iniciado
	let time = new Date();

	// Limpa cena atual
	gameContainer.children = [];

	// Cria um array com o numero de cartas(8) e duplica cada valor [0,0,1,1,...,7,7] criando 8 pares
	var chosenTiles = new Array();

	while (chosenTiles.length < 16) {
		var candidate = Math.floor(Math.random() * 8);

		if (chosenTiles.indexOf(candidate) == -1) {
			chosenTiles.push(candidate, candidate)
		}
	}

	// Embaralha esses valores pra que crie um jogo aleatório diferente pra cada inicio
	for (i = 0; i < 16; i++) {
		var from = Math.floor(Math.random() * 16);
		var to = Math.floor(Math.random() * 16);
		var tmp = chosenTiles[from];
		chosenTiles[from] = chosenTiles[to];
		chosenTiles[to] = tmp;
	}

	// Separa em linhas e colunas (4 linhas 4 colunas) (8 pares)
	for (i = 0; i < 4; i++) {
		for (j = 0; j < 4; j++) {

			// Nova carta a partir da posição do array embaralhado
			var tile = PIXI.Sprite.fromFrame(chosenTiles[i * 4 + j]);

			// Torna cada carta interativa para receber ações
			tile.buttonMode = true;
			tile.interactive = true;

			// Flag para seleção da carta
			tile.isSelected = false;

			// Define um valor pra carta com o mesmo valor da sua posição
			tile.theVal = chosenTiles[i * 4 + j]

			// Define o tamanho para cada carta
			tile.height = 200;
			tile.width = 200;

			// Distribuição das cartas no grid
			tile.position.x = 5 + i * 230;
			tile.position.y = 5 + j * 230;

			// Fundo para a carta virada (preto com transparência)
			tile.tint = 0x000000;
			tile.alpha = 0.7;

			// Adiciona carta na cena
			gameContainer.addChild(tile);

			// Evento para escutar o clique do mouse do usuário
			tile.mousedown = tile.touchstart = function (data) {

				if (canPick) {
					if (!this.isSelected) {
						// Define a flag como carta selecionada
						this.isSelected = true;

						// remove o efeito para mostrar a carta clicada
						this.tint = 0xffffff;
						this.alpha = 1;

						// se for o primeiro clique
						if (firstTile == null) {
							firstTile = this
						}

						// se não clicou numa carta de segundo clique
						else {
							secondTile = this

							// bloqueia seleção de uma terceira carta
							canPick = false;

							// Se o valor da primeira carta for igual ao valor da segunda carta
							if (firstTile.theVal == secondTile.theVal) {
								setTimeout(function () {

									// Remove as duas cartas da cena
									gameContainer.removeChild(firstTile);
									gameContainer.removeChild(secondTile);

									firstTile = null;
									secondTile = null;

									// Após 1 segundo, libera para escolher novamente
									canPick = true;

									// Caso a cena esteja vazia, renderiza o menu de jogar novamente
									if (!gameContainer.children.length) {
										playAgain(time);
									}

								}, 1000);
							}

							// Se as duas cartas forem diferentes
							else {
								setTimeout(function () {
									firstTile.isSelected = false
									secondTile.isSelected = false

									// Aplica o efeito de esconder novamente
									firstTile.tint = 0x000000;
									secondTile.tint = 0x000000;
									firstTile.alpha = 0.7;
									secondTile.alpha = 0.7;

									firstTile = null;
									secondTile = null;

									// Após 1 segundo, libera para escolher novamente
									canPick = true

								}, 1000);
							}
						}
					}
				}
			}
		}
	}
	requestAnimFrame(animate);
}

const animate = () => {
	requestAnimFrame(animate);
	renderer.render(stage);
}