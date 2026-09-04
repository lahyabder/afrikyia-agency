import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'src', 'data', 'files.json');
const uploadDir = path.join(process.cwd(), 'public', 'uploads');

// Helper to read data safely
function readData() {
    try {
        if (!fs.existsSync(dataFilePath)) {
            return [];
        }
        const fileContent = fs.readFileSync(dataFilePath, 'utf8');
        return JSON.parse(fileContent);
    } catch (error) {
        console.error('Error reading files data:', error);
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
        console.error('Error writing files data:', error);
        return false;
    }
}

export async function GET() {
    const data = readData();
    return NextResponse.json(data);
}

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        
        const file = formData.get('file') as File | null;
        const fileName = formData.get('fileName') as string;
        const category = formData.get('category') as string;
        const description = formData.get('description') as string;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // Ensure upload directory exists
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        // Save file physically
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const originalExtension = path.extname(file.name);
        const safeFileName = `${uniqueSuffix}${originalExtension}`;
        const filePath = path.join(uploadDir, safeFileName);
        
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        fs.writeFileSync(filePath, buffer);

        // Save metadata
        let data = readData();
        
        const newFile = {
            id: `file-${Date.now()}`,
            name: fileName || file.name,
            originalName: file.name,
            url: `/uploads/${safeFileName}`,
            size: file.size,
            type: file.type,
            category: category || 'other',
            description: description || '',
            date: new Date().toISOString()
        };
        
        data.push(newFile);
        
        const success = writeData(data);
        if (!success) {
            return NextResponse.json({ 
                error: 'ReadOnlyFileSystem', 
                message: 'Running in read-only environment. Modifications will persist in browser localStorage.',
                data 
            }, { status: 200 });
        }

        return NextResponse.json({ success: true, data: newFile });
    } catch (error: any) {
        console.error("API files error:", error);
        return NextResponse.json({ error: 'Server error', message: error.message }, { status: 500 });
    }
}
