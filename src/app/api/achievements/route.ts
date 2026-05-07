import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'src', 'data', 'achievements.json');

// Helper to read data safely
function readData() {
    try {
        if (!fs.existsSync(dataFilePath)) {
            return [];
        }
        const fileContent = fs.readFileSync(dataFilePath, 'utf8');
        return JSON.parse(fileContent);
    } catch (error) {
        console.error('Error reading achievements data:', error);
        return [];
    }
}

// Helper to write data safely
function writeData(data: any) {
    try {
        const dir = path.dirname(dataFilePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 4), 'utf8');
        return true;
    } catch (error) {
        console.error('Error writing achievements data:', error);
        return false;
    }
}

export async function GET() {
    const data = readData();
    return NextResponse.json(data);
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { action, achievement } = body;

        let data = readData();

        if (action === 'add') {
            const newAchievement = {
                ...achievement,
                id: achievement.id || `ach-${Date.now()}`
            };
            data.push(newAchievement);
        } else if (action === 'edit') {
            data = data.map((item: any) => item.id === achievement.id ? achievement : item);
        } else if (action === 'delete') {
            data = data.filter((item: any) => item.id !== achievement.id);
        } else {
            return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }

        const success = writeData(data);
        if (!success) {
            // Return 200 with notice of ReadOnly filesystem (for production environments like Vercel serverless)
            return NextResponse.json({ 
                error: 'ReadOnlyFileSystem', 
                message: 'Running in read-only environment. Modifications will persist in browser localStorage.',
                data 
            }, { status: 200 });
        }

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        return NextResponse.json({ error: 'Server error', message: error.message }, { status: 500 });
    }
}
