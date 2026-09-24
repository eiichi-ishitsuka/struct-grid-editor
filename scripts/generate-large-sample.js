#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const YAML = require('yaml');

// Parse CLI arguments
const args = process.argv.slice(2);
let count = 1000;
let format = 'all'; // 'json', 'yaml', 'jsonl', or 'all' ('both' maintained for backwards compatibility)

for (let i = 0; i < args.length; i++) {
    if (args[i] === '--count' || args[i] === '-c') {
        count = parseInt(args[i + 1], 10) || 1000;
        i++;
    } else if (args[i] === '--format' || args[i] === '-f') {
        format = args[i + 1] || 'all';
        i++;
    }
}

const roles = ['Engineer', 'Designer', 'Product Manager', 'Data Analyst', 'QA Specialist'];
const departments = ['Engineering', 'Product', 'Design', 'Growth', 'Operations'];
const tagsPool = ['remote', 'lead', 'full-time', 'contractor', 'mentorship', 'core-team'];

console.log(`Generating ${count} sample records...`);

const records = [];
for (let i = 1; i <= count; i++) {
    const roleIdx = i % roles.length;
    const deptIdx = i % departments.length;
    const isAct = i % 7 !== 0;
    const userTags = [
        tagsPool[i % tagsPool.length],
        tagsPool[(i + 2) % tagsPool.length]
    ];

    records.push({
        id: i,
        name: `User_${i}`,
        email: `user${i}@example.com`,
        department: departments[deptIdx],
        role: roles[roleIdx],
        active: isAct,
        rating: Math.round(((i * 17) % 50 + 50) / 10 * 10) / 10,
        tags: userTags,
        metadata: {
            loginCount: (i * 3) % 150,
            notifications: i % 2 === 0,
            tier: i % 3 === 0 ? 'Enterprise' : 'Standard'
        }
    });
}

const baseDir = path.resolve(__dirname, '..');
const outputDir = path.join(baseDir, 'samples', 'large_data');

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

if (format === 'json' || format === 'both' || format === 'all') {
    const jsonPath = path.join(outputDir, `large-sample-${count}.json`);
    fs.writeFileSync(jsonPath, JSON.stringify(records, null, 2), 'utf-8');
    console.log(`Successfully generated JSON: ${jsonPath} (${(fs.statSync(jsonPath).size / 1024).toFixed(1)} KB)`);
}

if (format === 'yaml' || format === 'both' || format === 'all') {
    const yamlPath = path.join(outputDir, `large-sample-${count}.yaml`);
    fs.writeFileSync(yamlPath, YAML.stringify(records), 'utf-8');
    console.log(`Successfully generated YAML: ${yamlPath} (${(fs.statSync(yamlPath).size / 1024).toFixed(1)} KB)`);
}

if (format === 'jsonl' || format === 'both' || format === 'all') {
    const jsonlPath = path.join(outputDir, `large-sample-${count}.jsonl`);
    const jsonlContent = records.map(r => JSON.stringify(r)).join('\n') + '\n';
    fs.writeFileSync(jsonlPath, jsonlContent, 'utf-8');
    console.log(`Successfully generated JSONL: ${jsonlPath} (${(fs.statSync(jsonlPath).size / 1024).toFixed(1)} KB)`);
}
