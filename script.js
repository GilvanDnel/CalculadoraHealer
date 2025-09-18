document.getElementById('calculateBtn').addEventListener('click', calculateAllHealing);

function calculateAllHealing() {
    // --- PARTE 1: PEGAR OS DADOS DO USUÁRIO (INPUTS) ---
    const minDamage = parseFloat(document.getElementById('minDamage').value);
    const maxDamage = parseFloat(document.getElementById('maxDamage').value);
    const magicCritDamage = parseFloat(document.getElementById('magicCritDamage').value) / 100;
    const maxMana = parseFloat(document.getElementById('maxMana').value);
    const buffDuration = parseFloat(document.getElementById('buffDuration').value) / 100;
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
    
    let totalHealingBonus = 238.27; // Base
    let healingBonusBreakdown = `  - Base Healing: 238.27%\n`;
    
    if (isDay) {
        totalHealingBonus += 43.2; 
        healingBonusBreakdown += `  - Devotion + Light (Day): 43.20%\n`;
    }
    
    const nobleRevivalBonus = 3.02 * (maxMana / 1000);
    totalHealingBonus += nobleRevivalBonus;
    healingBonusBreakdown += `  - Noble Revival: ${nobleRevivalBonus.toFixed(2)}%\n`;

    const saintOathBonus = 15 * saintOathStacks;
    totalHealingBonus += saintOathBonus;
    healingBonusBreakdown += `  - Saint's Oath (${saintOathStacks} stacks): ${saintOathBonus.toFixed(2)}%\n`;
    
    const selflessSoulBonus = 8.2 * selflessSoulStacks;
    totalHealingBonus += selflessSoulBonus;
    healingBonusBreakdown += `  - Selfless Soul (${selflessSoulStacks} stacks): ${selflessSoulBonus.toFixed(2)}%\n`;

    if (isWisdomLow) {
        totalHealingBonus += 10;
        healingBonusBreakdown += `  - Blessing of Wisdom: 10.00%\n`;
    }
    healingBonusBreakdown += `-----------------------------------\n  Total: ${totalHealingBonus.toFixed(2)}%`;

    const skillDamageBoost = 0.201; // 20.1%
    const divineChoiceBonus = 0.12; // 12%
    const generalMultiplier = (1 + totalHealingBonus / 100) * (1 + skillDamageBoost) * (1 + divineChoiceBonus);
    
    const hotBonus = (36 + (6 * partyMembers));
    const hotMultiplier = 1 + hotBonus / 100;
    
    const cdr = 1 - ((1 - 0.541) * (1 - (isDay ? 0.10 : 0)) * (1 - 0.14));

    const critMultiplier = 1 + magicCritDamage;

    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = ''; // Limpa resultados anteriores

    // --- PARTE 3: CALCULAR E EXIBIR OS RESULTADOS ---
    const skills = [
        { name: 'Clay\'s Salvation', baseCooldown: 45, type: 'direct', formula: (dmg) => (dmg * 5.20) + 469, extraMultiplier: 1.15 },
        { name: 'Swift Healing', baseCooldown: 12, type: 'direct', formula: (dmg) => (dmg * 6.10) + 232 },
        { name: 'Fountain of Life', baseCooldown: 36, type: 'hot', formula: (dmg) => (dmg * 0.90) + 82, extraMultiplier: 1.15, duration: 6, ticks: 12, tickLabel: 'por tick' },
        { name: 'Healing Touch', baseCooldown: 6, type: 'hot', formula: (dmg) => (dmg * 0.31) + 22, duration: 6, ticks: 6, tickLabel: 'por segundo' },
        { name: 'Flash Wave', baseCooldown: 45, type: 'hot', formula: (dmg) => (dmg * 0.48) + 47, duration: 6, ticks: 6, tickLabel: 'por tick' },
    ];

    skills.forEach(skill => {
        let minBaseHeal = skill.formula(adjustedMinDamage);
        let maxBaseHeal = skill.formula(adjustedMaxDamage);

        let finalMultiplier = generalMultiplier * (skill.extraMultiplier || 1);
        if(skill.type === 'hot') {
            finalMultiplier *= hotMultiplier;
        }

        let minFinalHeal = minBaseHeal * finalMultiplier;
        let maxFinalHeal = maxBaseHeal * finalMultiplier;
        
        // Detalhes do cálculo
        let details = `Cálculo de Bônus de Cura Total:\n${healingBonusBreakdown}\n\n`;
        details += `Multiplicadores Finais:\n`;
        details += `  - Geral (Bônus Cura + Skill Dmg + Divine Choice): ${generalMultiplier.toFixed(2)}x\n`;
        if (skill.type === 'hot') details += `  - Bônus de HoT (${hotBonus.toFixed(0)}%): ${hotMultiplier.toFixed(2)}x\n`;
        if (skill.extraMultiplier) details += `  - Bônus Específico (Celestial Boost): ${skill.extraMultiplier.toFixed(2)}x\n`;
        details += `-----------------------------------\n`;
        details += `Cálculo da Cura (Mínima):\n`;
        details += `  - Cura Base da Skill: (${minDamage.toFixed(0)} Dmg + ${archerSurgeBonus}) * ${skill.formula.toString().match(/\* (\d+\.\d+)/)[1]} + ${skill.formula.toString().match(/\+ (\d+)/)[1]} = ${minBaseHeal.toFixed(0)}\n`;
        details += `  - Cura Final: ${minBaseHeal.toFixed(0)} * ${finalMultiplier.toFixed(2)} = ${minFinalHeal.toFixed(0)}\n`;

        // Cooldown e Duração
        const effectiveCooldown = skill.baseCooldown * (1 - cdr);
        let durationHtml = '';
        if (skill.duration) {
            const effectiveDuration = skill.duration * (1 + buffDuration);
            durationHtml = `<div class="result-item"><span class="duration">Duração Efetiva:</span> ${effectiveDuration.toFixed(2)}s</div>`;
        }

        const skillHtml = `
            <div class="skill-result">
                <h3>${skill.name}</h3>
                <div class="result-grid">
                    <div class="result-item"><span class="normal-heal">Cura Normal:</span> ${minFinalHeal.toFixed(0)} ~ ${maxFinalHeal.toFixed(0)} ${skill.tickLabel || ''}</div>
                    <div class="result-item"><span class="crit-heal">Cura Crítica:</span> ${(minFinalHeal * critMultiplier).toFixed(0)} ~ ${(maxFinalHeal * critMultiplier).toFixed(0)} ${skill.tickLabel || ''}</div>
                    <div class="result-item"><span class="cooldown">Recarga Efetiva:</span> ${effectiveCooldown.toFixed(2)}s</div>
                    ${durationHtml}
                </div>
                <details>
                    <summary>Ver Detalhes do Cálculo</summary>
                    <div class="details-content">${details}</div>
                </details>
            </div>
        `;
        resultsContainer.innerHTML += skillHtml;
    });
}