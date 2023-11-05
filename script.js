var player = {
    x: 400,
    y: 400,
    health: 20,
    max_health: 20,
    speed: 3,
    height: 100,
    sprite: 0,
    mana: 100,
    max_mana: 100
}
var spellbook_in_script = 'Spellbook';

var time_until_next_hit = 0;

var enemies = [{x: 100, y: 100, health: 50, max_health: 50, speed: 2, moving: false, sprite: 0, height: 125}]

var started_level = false;

var lost = false;

var in_spellbook = true;

var fireballs = [];

var spellbook = ['🝭/🜂|Ω∫|ω∫\\', '', '', '', '', '', '', '', ''];

var typeable_characters = [['≈', 'Ω', 'ω', 'Σ', 'π', 'μ', '≠', '≡', '%', '∫'], ['ϣ', 'ϩ', 'ϥ', 'ϫ', 'ϭ', '⊢', '⊣', '⊤', '⊥'], ['🝭', '🜂', '/', '\\', '|'], ['🝓', '🝦', '/', '\\', '⧱', '⧰', '☾', '☽']]

var keyboard_labels = ['Dgts', 'Var&op', 'Cmds', 'F_loop']

var spell_stack = -1;
var current_keyboard = -1



var blast_types = ['fire']

currtypes = []

var current_level = 1;
var current_spell_index = 0
var current_spell = spellbook[0];


var silent_chars = '/\\|'
var font;
var keybreak = false;

var floor, player;
function preload() {
    floor_pic = loadImage('https://i.imgur.com/e8bs4T7.jpg')
    wizard_sprites= [loadImage('https://i.imgur.com/zkETQUG.png')]
    enemy_sprites = [loadImage('https://i.imgur.com/aMs0dxm.png'), loadImage('https://i.imgur.com/9UIVQUu.png'), loadImage('https://i.imgur.com/AkDl0Eu.png')]
    fireball_sprites = [loadImage('https://i.imgur.com/N9DYWGo.png')]
    font = loadFont('https://runewrite--mrhitech.repl.co/assets/Symbola.ttf')

}

function goon(ex, why) {
    return {x: ex, y: why, health: 30, max_health: 30, speed: 2, moving: false, sprite: 0, height: 125}
}

function lancer(ex, why) {
    return {x: ex, y: why, health: 20, max_health: 20, speed: 3, moving: false, sprite: 2, height: 125}
}

function king(ex, why) {
    return {x: ex, y: why, health: 60, max_health: 60, speed: 1, moving: false, sprite: 1, height: 150}
}



function initialize_level(level) {
    if (level == 1) {
        enemies = [goon(100, 100)]
    }
    else if (level == 2) {
        enemies = [goon(100, 100), goon(700, 700)]
    }
    else if (level == 3) {
        enemies = [lancer(100, 100)]
    }
    else if (level == 4) {
        enemies = [lancer(100, 100), lancer(700, 700)]
    }
    else if (level == 5) {
        enemies = [lancer(200, 100), goon(100, 200), king(50, 50)]
    }
    else if (level == 6) {
        won = true;
        return;
    }

    spell_stack = -1
    player.x = 400;
    player.y = 400;
    // player.health = player.max_health;
    player.mana = player.max_mana

    time_until_next_hit = 0;

    started_level = true;

    lost = false;

    fireballs = [];
    current_keyboard = -1;
}


function range(length) {
    to_return = []
    for (var i = 0; i < length; i ++) {
        to_return.push(1)
    }
    return to_return
}


l = range(1)
ll = range(2)
lll = range(3)
llll = range(4)
lllll = range(5)
llllll = range(6)
lllllll = range(7)
llllllll = range(8)

function setup() {
    screen = createCanvas(800, 800)
    screen.parent('screen')
    imageMode(CENTER);
    rectMode(CORNER);
    textFont(font);
    textWrap(CHAR);
    textAlign(CENTER);
    

}



function shoot(type, damage, speed, direction_addend=0) {
    direction_addend = parseInt(direction_addend)
    
    fireball_to_add = {x: player.x, 
        y: player.y, 
        speed: speed, 
        direction: Math.atan((mouseY - player.y) / (mouseX - player.x)) + direction_addend, 
        type: blast_types.indexOf(type), 
        left_or_right: 0,
        damage: damage
    }

    

    if (mouseX < player.x) {
        fireball_to_add.left_or_right = -1;
    }
    else {
        fireball_to_add.left_or_right = 1;
    }

    fireballs.push(fireball_to_add)
    return true;
}


function prepare_spell(incantation) {
    if (started_level) {
        cost = mana_cost(incantation);
        player.mana -= cost;
        if (player.mana >= 0) {
            spell_stack = mana_cost(incantation);
        }
        else {
            player.mana += cost;
        }
    }
    
}

function modified_incantation(incantation) {
    for (i in silent_chars) {
        incantation = incantation.split(silent_chars[i]).join('')
    }
    return incantation;
}





function translate_for_cost_purposes(incantation) {
    originals = ['||', '🝭', '🜂', '∫', '≈', 'Ω', 'ω', 'Σ', 'π', 'μ', '≠', '≡', '%', '/', '\\', '|', '🝓', '🝦', '⧱', '⧰', 'ϣ', 'ϩ', 'ϥ', 'ϫ', 'ϭ', '☾', '☽', '⊢', '⊣', '⊤', '⊥']
    meanings = [';', 'energy_cost_of_a_fireball', '"fire"', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '(', ')', ',', 'for ', ' in ', 'range', 'l', 'w', 's', 'h', 'x', 'g', '{', '}', '+', '-', '*', '/']
    for (i in originals) {
        incantation = incantation.split(originals[i]).join(meanings[i])
    }
    return incantation
}


function mana_cost(incantation) {
    // Make better -- should be based on how much energy the spell will summon
    var to_return = 0;
    
    function energy_cost_of_a_fireball(type, damage, speed) {
        to_return += damage + speed * 2;
    }


    incantation = translate_for_cost_purposes(incantation);
    eval(incantation);

    return to_return;


}

function translate_component(component) {
    originals = ['||', '🝭', '🜂', '∫', '≈', 'Ω', 'ω', 'Σ', 'π', 'μ', '≠', '≡', '%', '/', '\\', '|', '🝓', '🝦', '⧱', '⧰', 'ϣ', 'ϩ', 'ϥ', 'ϫ', 'ϭ', '☾', '☽', '⊢', '⊣', '⊤', '⊥']
    meanings = [';', 'shoot', '"fire"', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '(', ')', ',', 'for ', ' in ', 'range', 'l', 'w', 's', 'h', 'x', 'g', '{', '}', '+', '-', '*', '/']
    if (originals.includes(component)) {
        return meanings[originals.indexOf(component)]
    }
    else {
        return component
    }
    
}

function credits() {
    window.location.href = '/credits'
}

function translate_incantation(incantation) {
    originals = ['||', '🝭', '🜂', '∫', '≈', 'Ω', 'ω', 'Σ', 'π', 'μ', '≠', '≡', '%', '/', '\\', '|', '🝓', '🝦', '⧱', '⧰', 'ϣ', 'ϩ', 'ϥ', 'ϫ', 'ϭ', '☾', '☽', '⊢', '⊣', '⊤', '⊥']
    meanings = [';', 'shoot', '"fire"', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '(', ')', ',', 'for ', ' in ', 'range', 'l', 'w', 's', 'h', 'x', 'g', '{', '}', '+', '-', '*', '/']
    for (i in originals) {
        incantation = incantation.split(originals[i]).join(meanings[i])
    }
    return incantation
}

function cast_spell(spell) {
    eval(translate_incantation(spell))
}

function healthbar(character) {
    health_fraction = character.health / character.max_health;

    push();
        translate(character.x, character.y - (character.height / 2) - 10)
        fill(192, 192, 0)
        rect(-30, -10, 60, 20)
        fill(255, 0, 0)
        rect(-25, -5, 50, 10)
        fill(0, 255, 0)
        rect(-25, -5, 50 * health_fraction, 10)
    pop();
}

function manabar(character) {
    mana_fraction = character.mana / character.max_mana;

    push();
        translate(character.x, character.y - (character.height / 2) - 30)
        fill(192, 192, 0)
        rect(-30, -10, 60, 20)
        fill(255, 0, 0)
        rect(-25, -5, 50, 10)
        fill(30, 199, 250)
        rect(-25, -5, 50 * mana_fraction, 10)
    pop();
}

function character_above_head(character, char) {
    push();
        translate(character.x, character.y - (character.height / 2) - 60)
        fill(192, 192, 0)
        text(char, 0, 0)
    pop();
}

function get_current_typeables() {
    if (current_keyboard == -1) {
        return keyboard_labels;
    }
    else {
        return typeable_characters[current_keyboard]
    }
}

function draw() {
    
    // []
    if (in_spellbook) {
        background(73, 8, 156)
        textSize(100)
        textAlign(CENTER, CENTER)
        fill(250, 180, 30)
        text(spellbook_in_script, screen.width / 2, 100)

        
        

        


        textSize(20)

        textWrap(CHAR)
        for (i in spellbook) {
            
            if (i == current_spell_index) {
                fill(250, 180, 30);
            }
            else {
                fill(0, 0, 255);
            }
            rect(450 + 150 * Math.floor(i / 5), 200 + 100 * (i % 5), 150, 100)
            if (i == current_spell_index) {
                fill(0, 0, 255);
            }
            else {
                fill(250, 180, 30);
            }
            
            text(spellbook[i], 450 + 150 * Math.floor(i / 5), 250 + 100 * (i % 5), 150)
        }
        currtypes = get_current_typeables()
        
        for (i in currtypes) {
            fill(0, 0, 255)
            rect(25 + 75 * i, 715, 75, 30)
            rect(25 + 75 * i, 755, 75, 30)
            fill(250, 180, 50)
            text(currtypes[i], 60 + 75 * i, 730)
            if ('⊣'.includes(currtypes[i])) {
                push()
                console.log('here')
                textSize(40);
                text(translate_component(currtypes[i]), 60 + 75 * i, 770)
                pop();
            }
            else {
                text(translate_component(currtypes[i]), 60 + 75 * i, 770)
            }
            
            
            
        }

        textSize(50);
        textWrap(CHAR)
        text("Spell #" + (current_spell_index + 1), 200, 250)
        text(current_spell, 25, 350, 350)
        textSize(25)
        textWrap(WORD)
        text(translate_incantation(current_spell), 25, 550, 350);



    }

    else if (!lost && started_level) {
        wizard_sprites[player.sprite].resize(0, player.height);
        


        frameRate(30);
        background(0);
        
        


        player.moving = true
        if (keyIsDown(LEFT_ARROW) || keyIsDown(RIGHT_ARROW) || keyIsDown(UP_ARROW) || keyIsDown(DOWN_ARROW)) {
            player_moving = true;
            if (keyIsDown(LEFT_ARROW)) {
                player.x -= player.speed;
            }
            if (keyIsDown(RIGHT_ARROW)) {
                player.x += player.speed;
            }
            if (keyIsDown(UP_ARROW)) {
                player.y -= player.speed;
            }
            if (keyIsDown(DOWN_ARROW)) {
                player.y += player.speed;
            }
        }
        else {
            player.moving = false;
        }

        if (player.y < player.height / 2) {
            player.y = player.height / 2;
        }

        if (player.y > (screen.height - player.height / 2)) {
            player.y = (screen.height - player.height / 2)
        }

        if (player.x < 0) {
            player.x = 0;
        }

        if (player.x > (screen.width)) {
            player.x = (screen.width)
        }

        if ('123456789'.includes(key)) {
            current_spell_index = parseInt(key) - 1
            current_spell = spellbook[current_spell_index];
        }



        

        image(floor_pic, 400, 400, 800, 800)
        
        text('', 400, 400)
        text("Selected: Spell #" + (current_spell_index + 1), 400, 650)
        text(current_spell, 400, 700)
        text(translate_incantation(current_spell), 400, 750)
        textSize(50);


        if (!(Math.floor(time_until_next_hit / 3) % 2)) {
            image(wizard_sprites[player.sprite], player.x, player.y)
        }

        for (i in enemies) {
            enemy = enemies[i];
            enemy_sprites[enemy.sprite].resize(0, enemy.height)

            image(enemy_sprites[enemy.sprite], enemy.x, enemy.y)
            if (Math.abs(enemy.x - player.x) <= 40 && Math.abs(enemy.y - player.y) <= 90 && !time_until_next_hit) {
                time_until_next_hit = 60;
                player.health -= 5;
            }

            if (enemy.x < player.x) {
                if (abs(enemy.x - player.x) < enemy.speed) {
                    enemy.x = player.x;
                }
                else {
                    enemy.x += enemy.speed;
                }
            }
            else if (enemy.x > player.x) {
                if (abs(enemy.x - player.x) < enemy.speed) {
                    enemy.x = player.x;
                }
                else {
                    enemy.x -= enemy.speed;
                }
            }

            if (enemy.y < player.y) {
                if (abs(enemy.y - player.y) < enemy.speed) {
                    enemy.y = player.y;
                }
                else {
                    enemy.y += enemy.speed;
                }
            }
            else if (enemy.y > player.y) {
                if (abs(enemy.y - player.y) < enemy.speed) {
                    enemy.y = player.y;
                }
                else {
                    enemy.y -= enemy.speed;
                }
            }
        }

        spliced = false;

        if (spell_stack == 0) {
            cast_spell(current_spell)
        }
        else if (spell_stack >= 0) {
            modded_spell = [...modified_incantation(current_spell)]
            
            current_spell_character = modded_spell[Math.floor((mana_cost(current_spell) - spell_stack) / mana_cost(current_spell) * modded_spell.length)]
            character_above_head(player, current_spell_character)
        }

        if (spell_stack >= 0) {
            spell_stack --;
        }
        




        for (i in fireballs) {
            if (spliced) {
                i --;
                spliced = false;
            }
            spliced = false;
            fireball = fireballs[i]
            fireball.x += fireball.speed * Math.cos(fireball.direction) * fireball.left_or_right;
            fireball.y += fireball.speed * Math.sin(fireball.direction) * fireball.left_or_right;

            if (fireball.x < 0 || fireball.x > screen.width || fireball.y < 0 || fireball.y > width) {
                fireballs.splice(i, 1)
                spliced = true
                continue;
            }

            image(fireball_sprites[fireball.type], fireball.x, fireball.y, 50, 50)
        // }
        // for (i in fireballs) {
        //     i = fireballs.length - i - 1;
            for (j in enemies) {
                enemy = enemies[j]
                if (Math.abs(enemy.x - fireball.x) <= 40 && Math.abs(enemy.y - fireball.y) <= 50) {
                    enemy.health -= fireball.damage;                
                    fireballs.splice(i, 1);
                    spliced = true;
                    if (enemy.health <= 0) {
                        enemies.splice(j, 1);
                        
                    }
                }
            }
        }
        if (enemies.length == 0) {
            started_level = false;
            in_spellbook = true;
            current_level += 1
        }

        if (spell_stack == -1) {
            player.mana ++;
        }
        

        if (player.mana > player.max_mana) {
            player.mana = player.max_mana;
        }


        
        if (time_until_next_hit > 0) {
            time_until_next_hit -= 1;
        }

        if (player.health <= 0) {
            lost = true;
        }
        healthbar(player)
        manabar(player)
        for (j in enemies) {
            healthbar(enemies[j])
        }

    }


    else if (lost) {
        background(255, 0, 0);
        textSize(100)
        text('You lost!', 400, 300)
        push();
            textSize(70);
            text('Press Enter to retry.', 400, 500);
        pop();

    }
    else if (won) {
        background(0, 192, 0);
        textSize(100);
        text('You won!', 400, 300)
        text('Press c for credits', 400, 500)
    }



    
    
    
}
function mouseClicked() {
    if (spell_stack == -1) {
        if (started_level && !in_spellbook) {
            prepare_spell(current_spell)
        }
    }
}

function keyPressed() {
    if (key == 'c' && won) {
        credits();
    }
    if (in_spellbook) {
        if (key == ('ArrowUp')) {
            current_spell_index -= 1;
        }
        else if (key == 'ArrowDown') {
            current_spell_index += 1;
        }
        else if (key == ('ArrowLeft')) {
            current_spell_index -= 5;
        }
        else if (key == ('ArrowRight')) {
            current_spell_index += 5;
        }

        if (current_spell_index < 0) {
            current_spell_index = 0;
        }

        else if (current_spell_index >= 9) {
            current_spell_index = 8;
        }

        if (key == ('Enter')) {
            in_spellbook = false;
            initialize_level(current_level);
        }

        current_spell = spellbook[current_spell_index];

        if ('1234567890'.includes(key)) {
            num_selected = parseInt(key) - 1;
            if (num_selected == -1) {
                num_selected = 9;
            }
            if (num_selected < currtypes.length) {
                choice = currtypes[num_selected]
            }

            else{
                choice = ''
            }
            if (current_keyboard >= 0) {
                spellbook[current_spell_index] += choice
                current_spell = spellbook[current_spell_index]
            }
            else if (current_keyboard == -1 && choice) {
                current_keyboard = num_selected;
            }
        }
        if (key == 'Backspace') {
            current_spell = [...current_spell].slice(0, [...current_spell].length - 1).join('');
            spellbook[current_spell_index] = current_spell
        }
        if (key == 'Escape') {
            current_keyboard = -1
        }
    }

    if (lost) {
        if (key == 'Enter') {
            lost = false;
            in_spellbook = true;
            started_level = false;
            current_level = 1;
            player.health = player.max_health; 
            initialize_level(current_level)
        }
    }
    

}
