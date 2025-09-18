document.getElementById('calculateBtn').addEventListener('click', calculateAllHealing);

function calculateAllHealing() {
    // --- PARTE 1: PEGAR OS DADOS DO USUÁRIO (INPUTS) ---
    const minDamage = parseFloat(document.getElementById('minDamage').value);
    const maxDamage = parseFloat(document.getElementById('maxDamage').value);
    const magicCritChance = parseFloat(document.getElementById('magicCritChance').value) / 100; // Não usado no cálculo final da cura, mas bom ter
    const magicCritDamage = parseFloat(document.getElementById('magicCritDamage').value) / 100;
    const maxMana = parseFloat(document.getElementById('maxMana').value);
    const buffDurationInput = parseFloat(document.getElementById('buffDuration').value) / 100;
    const partyMembers = parseInt(document.getElementById('partyMembers').value);
    const saintOathStacks = parseInt(document.getElementById('saintOathStacks').value);
    const selflessSoulStacks = parseInt(document.getElementById('selflessSoulStacks').value);
    const archerSurgeStacks = parseInt(document.getElementById('archerSurgeStacks').value);
    const isDay = document.getElementById('isDay').checked;
    const isWisdomLow = document.getElementById('isWisdomLow').checked;

    // --- PARTE 2: CALCULAR OS STATUS CONSOLIDADOS ---
    const archerSurgeBonus = 5 * archerSurgeStacks;
    const adjustedMinDamage = minDamage + archerSurgeBonus;
    const adjustedMaxDamage = maxDamage + archerSurgeBonus;
    
    let totalHealingBonus = 238.27; // Base da sua ficha
    let healingBonusBreakdown = `  - Healing Base da Ficha: 238.27%\n`;
    
    // Devotion and Emptiness (Day) + Light of Devotion
    if (isDay) {
        totalHealingBonus += 36 * 1.2; // 36% base + 20% do Light of Devotion
        healingBonusBreakdown += `  - Devotion and Emptiness (Dia) + Light of Devotion: (36% * 1.2) = 43.20%\n`;
    } else { // Noite, mas o foco é cura
        // Se não é dia, a passiva dá bônus de dano DOT e não de healing (conforme sua imagem)
        healingBonusBreakdown += `  - Devotion and Emptiness (Noite): Sem bônus direto para Healing.`;
    }
    
    const nobleRevivalBonus = 3.02 * (maxMana / 1000);
    totalHealingBonus += nobleRevivalBonus;
    healingBonusBreakdown += `  - Noble Revival (por 1k Mana): ${nobleRevivalBonus.toFixed(2)}% (Max Mana: ${maxMana})\n`;

    const saintOathBonus = 15 * saintOathStacks;
    totalHealingBonus += saintOathBonus;
    healingBonusBreakdown += `  - Saint's Oath (${saintOathStacks} stacks): ${saintOathBonus.toFixed(2)}%\n`;
    
    const selflessSoulBonus = 8.2 * selflessSoulStacks;
    totalHealingBonus += selflessSoulBonus;
    healingBonusBreakdown += `  - Selfless Soul (${selflessSoulStacks} stacks): ${selflessSoulBonus.toFixed(2)}%\n`;

    if (isWisdomLow) {
        totalHealingBonus += 10;
        healingBonusBreakdown += `  - Blessing of Wisdom (Wisdom < 80): 10.00%\n`;
    }
    healingBonusBreakdown += `-----------------------------------\n  Total de Bônus de Healing: ${totalHealingBonus.toFixed(2)}%`;

    const skillDamageBoost = 0.201; // 20.1% da sua ficha
    const divineChoiceBonus = 0.12; // 12% da Divine Choice
    const generalMultiplier = (1 + totalHealingBonus / 100) * (1 + skillDamageBoost) * (1 + divineChoiceBonus);
    
    // HoT Bonus Calculation
    const earthBlessingHotBonus = 36; // Earth's Blessing 36%
    const distortedSanctuaryHotBonus = 6 * partyMembers; // Distorted Sanctuary 6% por membro
    const totalHotBonus = earthBlessingHotBonus + distortedSanctuaryHotBonus;
    const hotMultiplier = 1 + totalHotBonus / 100;
    
    let hotBreakdown = `  - Earth's Blessing: ${earthBlessingHotBonus}%\n`;
    hotBreakdown += `  - Distorted Sanctuary (${partyMembers} membros): ${distortedSanctuaryHotBonus}%\n`;
    hotBreakdown += `-----------------------------------\n  Total de Bônus HoT: ${totalHotBonus.toFixed(2)}%`;


    // Cooldown Reduction (CDR)
    const baseCDR = 0.541; // 54.1% da sua ficha
    const devotionDayCDR = isDay ? 0.10 : 0; // Devotion and Emptiness (Day)
    const blessedHasteCDR = 0.14; // Blessed Haste

    const effectiveCDR = 1 - ((1 - baseCDR) * (1 - devotionDayCDR) * (1 - blessedHasteCDR));
    const cdrBreakdown = `  - Base Cooldown Speed: ${ (baseCDR*100).toFixed(1) }%\n` + 
                         `  - Devotion and Emptiness (Dia): ${ (devotionDayCDR*100).toFixed(1) }%\n` +
                         `  - Blessed Haste: ${ (blessedHasteCDR*100).toFixed(1) }%\n` +
                         `-----------------------------------\n  Recarga Efetiva Total: ${ (effectiveCDR*100).toFixed(1) }%`;

    // Buff Duration
    const effectiveBuffDurationMultiplier = 1 + buffDurationInput;
    const buffDurationBreakdown = `  - Duração de Buff da Ficha: ${ (buffDurationInput*100).toFixed(1) }%\n` +
                                  `-----------------------------------\n  Multiplicador Efetivo: ${ effectiveBuffDurationMultiplier.toFixed(2) }x`;


    const critMultiplier = 1 + magicCritDamage;

    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = ''; // Limpa resultados anteriores

    // Descrições das Skills Ativas e Passivas (para os detalhes)
    const skillDescriptions = {
        'Clay\'s Salvation': {
            active: "Restaura Saúde igual a 520% do Dano Base + 469 de dano para todos os membros do grupo dentro do alcance. Nível 15.",
            passives: {
                'Celestial Boost': "Aumenta o efeito de Clay's Salvation em 15%.",
            }
        },
        'Swift Healing': {
            active: "Restaura a Saúde de um aliado igual a 610% do Dano Base + 232 de dano. Pode ser usada até 2 vezes seguidas. A cura diminui 30% a cada uso consecutivo. Nível 15.",
            passives: {} // Sem passivas diretas
        },
        'Fountain of Life': {
            active: "Cria uma área de 3m de raio no local designado por 6s. Membros do grupo dentro da área recuperam 90% do Dano Base + 82 a cada 0.5s. Nível 15.",
            passives: {
                'Celestial Boost': "Aumenta o efeito de Fountain of Life em 15%.",
                'Earth\'s Blessing': "Aumenta a Recuperação Contínua de Saúde de habilidades em 36%.",
                'Distorted Sanctuary': "Aumenta a Recuperação Contínua de Saúde de habilidades em 6% por membro do grupo."
            }
        },
        'Healing Touch': {
            active: "Concede um efeito de cura a aliados, restaurando Saúde igual a 31% do Dano Base + 22 de Saúde por segundo por 6s. Acumula até 3 vezes. Nível 12.",
            passives: {
                'Earth\'s Blessing': "Aumenta a Recuperação Contínua de Saúde de habilidades em 36%.",
                'Distorted Sanctuary': "Aumenta a Recuperação Contínua de Saúde de habilidades em 6% por membro do grupo."
            }
        },
        'Flash Wave': {
            active: "Envia uma grande flecha que causa 360% do Dano Base + 350 a 720% do Dano Base + 700 de dano aos inimigos. Aliados dentro da área recebem cura contínua igual a 48% do Dano Base + 47 por 6s. Nível 12.",
            passives: {
                'Earth\'s Blessing': "Aumenta a Recuperação Contínua de Saúde de habilidades em 36%.",
                'Distorted Sanctuary': "Aumenta a Recuperação Contínua de Saúde de habilidades em 6% por membro do grupo."
            }
        },
        'Nature\'s Blessing': {
            active: "Concede Nature's Blessing a membros do grupo dentro de 16m por 4s. Remove efeito de enfraquecer, aumenta Health Regen em 800 e Mana Regen em 1470, e então aumenta Health Regen novamente em 200%. Nível 15.",
            passives: {} // Sem passivas diretas para o cálculo de cura aqui
        }
    };


    const skillsToCalculate = [
        { id: 'claySalvation', name: 'Clay\'s Salvation', baseCooldown: 45, type: 'direct', formula: (dmg) => (dmg * 5.20) + 469, extraMultiplier: 1.15, description: skillDescriptions['Clay\'s Salvation'] },
        { id: 'swiftHealing', name: 'Swift Healing', baseCooldown: 12, type: 'direct', formula: (dmg) => (dmg * 6.10) + 232, description: skillDescriptions['Swift Healing'] },
        { id: 'fountainOfLife', name: 'Fountain of Life', baseCooldown: 36, type: 'hot', formula: (dmg) => (dmg * 0.90) + 82, extraMultiplier: 1.15, duration: 6, ticks: 12, tickLabel: 'por tick', description: skillDescriptions['Fountain of Life'] },
        { id: 'healingTouch', name: 'Healing Touch', baseCooldown: 6, type: 'hot', formula: (dmg) => (dmg * 0.31) + 22, duration: 6, ticks: 6, tickLabel: 'por segundo', description: skillDescriptions['Healing Touch'] },
        { id: 'flashWave', name: 'Flash Wave', baseCooldown: 45, type: 'hot', formula: (dmg) => (dmg * 0.48) + 47, duration: 6, ticks: 6, tickLabel: 'por tick', description: skillDescriptions['Flash Wave'] },
        { id: 'naturesBlessing', name: 'Nature\'s Blessing', baseCooldown: 45, type: 'regen', formula: () => 800 * 3, duration: 4, description: skillDescriptions['Nature\'s Blessing']} // 800 * (1 + 200%) = 2400 Health Regen
    ];

    skillsToCalculate.forEach(skill => {
        let minBaseHeal = skill.formula(adjustedMinDamage);
        let maxBaseHeal = skill.formula(adjustedMaxDamage);

        let finalMultiplier = generalMultiplier * (skill.extraMultiplier || 1);
        if (skill.type === 'hot') {
            finalMultiplier *= hotMultiplier;
        } else if (skill.type === 'regen') {
            // Nature's Blessing é um caso especial, Health Regen não escala com Healing/Skill Damage Boost
            minBaseHeal = skill.formula(); // Chama a formula sem passar dano base
            maxBaseHeal = skill.formula(); // Max e Min são iguais para Health Regen
            finalMultiplier = 1; // Não aplica o generalMultiplier nem hotMultiplier
        }

        let minFinalHeal = minBaseHeal * finalMultiplier;
        let maxFinalHeal = maxBaseHeal * finalMultiplier;
        
        // Detalhes do cálculo
        let detailsContent = `**Descrições da Habilidade:**\n`;
        detailsContent += `  - **Ativa:** ${skill.description.active}\n`;
        if (Object.keys(skill.description.passives).length > 0) {
            detailsContent += `  - **Passivas Relevantes:**\n`;
            for (const passiveName in skill.description.passives) {
                detailsContent += `    - ${passiveName}: ${skill.description.passives[passiveName]}\n`;
            }
        } else {
            detailsContent += `  - **Passivas Relevantes:** Nenhuma diretamente aplicada ao cálculo de cura/regen base.\n`;
        }
        detailsContent += `\n**Cálculo de Bônus de Cura Total:**\n${healingBonusBreakdown}\n\n`;
        detailsContent += `**Multiplicadores Finais Aplicados:**\n`;
        if (skill.type !== 'regen') { // Regen não usa General Multiplier
            detailsContent += `  - Multiplicador Geral (Bônus Cura + Skill Dmg + Divine Choice): ${generalMultiplier.toFixed(2)}x\n`;
        }
        if (skill.type === 'hot') detailsContent += `  - Multiplicador de HoT (Total ${totalHotBonus.toFixed(0)}%): ${hotMultiplier.toFixed(2)}x\n`;
        if (skill.extraMultiplier) detailsContent += `  - Multiplicador Específico (ex: Celestial Boost): ${skill.extraMultiplier.toFixed(2)}x\n`;
        detailsContent += `\n**Cálculo da Cura (Intervalo):**\n`;

        if (skill.type === 'regen') {
            detailsContent += `  - Tipo de Habilidade: Health Regen (não escala com bônus de cura)\n`;
            detailsContent += `  - Health Regen Base: ${skill.formula().toFixed(0)}\n`;
            detailsContent += `  - Health Regen Final: ${minFinalHeal.toFixed(0)} (não varia com dano min/max)\n`;
        } else {
            detailsContent += `  - Dano Base Ajustado: ${adjustedMinDamage.toFixed(0)} (Mín) ~ ${adjustedMaxDamage.toFixed(0)} (Máx) (considerando Archer's Surge)\n`;
            detailsContent += `  - Cura Base da Skill (Mín): ${minBaseHeal.toFixed(0)}\n`;
            detailsContent += `  - Cura Base da Skill (Máx): ${maxBaseHeal.toFixed(0)}\n`;
            detailsContent += `  - Cura Normal Final (Mín): ${minFinalHeal.toFixed(0)}\n`;
            detailsContent += `  - Cura Normal Final (Máx): ${maxFinalHeal.toFixed(0)}\n`;
            detailsContent += `  - Cura Crítica Final (Mín): ${(minFinalHeal * critMultiplier).toFixed(0)}\n`;
            detailsContent += `  - Cura Crítica Final (Máx): ${(maxFinalHeal * critMultiplier).toFixed(0)}\n`;
        }
        

        // Cooldown e Duração
        const effectiveCooldown = skill.baseCooldown * (1 - effectiveCDR);
        let durationHtml = '';
        let effectiveDuration = '';
        if (skill.duration) {
            effectiveDuration = skill.duration * effectiveBuffDurationMultiplier;
            durationHtml = `<div class="result-item"><span class="duration">Duração Efetiva:</span> ${effectiveDuration.toFixed(2)}s</div>`;
            
            // Adiciona detalhes de duração ao breakdown
            detailsContent += `\n**Cálculo da Duração do Efeito:**\n`;
            detailsContent += `${buffDurationBreakdown}\n`;
            detailsContent += `  - Duração Base da Skill: ${skill.duration}s\n`;
            detailsContent += `  - Duração Efetiva Final: ${skill.duration}s * ${effectiveBuffDurationMultiplier.toFixed(2)} = ${effectiveDuration.toFixed(2)}s\n`;

            if (skill.type === 'hot' && skill.ticks) {
                 const totalHoT = (maxFinalHeal * skill.ticks * (effectiveDuration / skill.duration));
                 const totalHoTCrit = (totalHoT * critMultiplier);
                 durationHtml += `<div class="result-item"><span class="duration">Cura Total HoT (Normal):</span> ${totalHoT.toFixed(0)}</div>`;
                 durationHtml += `<div class="result-item"><span class="duration">Cura Total HoT (Crítica):</span> ${totalHoTCrit.toFixed(0)}</div>`;
            }
        }

        // Adiciona detalhes de CDR ao breakdown
        detailsContent += `\n**Cálculo de Recarga:**\n`;
        detailsContent += `${cdrBreakdown}\n`;
        detailsContent += `  - Recarga Base da Skill: ${skill.baseCooldown}s\n`;
        detailsContent += `  - Recarga Efetiva Final: ${skill.baseCooldown}s * (1 - ${effectiveCDR.toFixed(2)}) = ${effectiveCooldown.toFixed(2)}s\n`;


        const skillHtml = `
            <div class="skill-result">
                <h3>${skill.name}</h3>
                <div class="result-grid">
                    ${skill.type === 'regen' ? 
                        `<div class="result-item"><span class="normal-heal">Health Regen:</span> ${minFinalHeal.toFixed(0)}</div>` :
                        `<div class="result-item"><span class="normal-heal">Cura Normal:</span> ${minFinalHeal.toFixed(0)} ~ ${maxFinalHeal.toFixed(0)} ${skill.tickLabel || ''}</div>
                         <div class="result-item"><span class="crit-heal">Cura Crítica:</span> ${(minFinalHeal * critMultiplier).toFixed(0)} ~ ${(maxFinalHeal * critMultiplier).toFixed(0)} ${skill.tickLabel || ''}</div>`
                    }
                    <div class="result-item"><span class="cooldown">Recarga Efetiva:</span> ${effectiveCooldown.toFixed(2)}s</div>
                    ${durationHtml}
                </div>
                <details>
                    <summary>Ver Detalhes do Cálculo</summary>
                    <div class="details-content">${detailsContent}</div>
                </details>
            </div>
        `;
        resultsContainer.innerHTML += skillHtml;
    });
}