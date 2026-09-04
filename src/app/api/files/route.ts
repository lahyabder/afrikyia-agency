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

        // Save file physically
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const originalExtension = path.extname(file.name);
        const safeFileName = `${uniqueSuffix}${originalExtension}`;
        const filePath = path.join(uploadDir, safeFileName);
        
        try {
            // Ensure upload directory exists
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            fs.writeFileSync(filePath, buffer);
        } catch (fileWriteError) {
            console.warn("Could not save physical file (likely read-only environment):", fileWriteError);
            // We continue processing to allow the mock UI to update even if we can't save the physical file
        }

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
                data: newFile 
            }, { status: 200 });
        }

        return NextResponse.json({ success: true, data: newFile });
    } catch (error: any) {
        console.error("API files error:", error);
        return NextResponse.json({ error: 'Server error', message: error.message }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { id } = await request.json();
        let data = readData();
        
        const fileIndex = data.findIndex((f: any) => f.id === id);
        if (fileIndex === -1) {
            return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }
        
        // Try to delete physical file
        try {
            const fileUrl = data[fileIndex].url;
            const filename = fileUrl.split('/').pop();
            const filePath = path.join(uploadDir, filename);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        } catch (e) {
            console.warn("Could not delete physical file:", e);
        }

        data = data.filter((f: any) => f.id !== id);
        const success = writeData(data);

        if (!success) {
            return NextResponse.json({ 
                error: 'ReadOnlyFileSystem', 
                message: 'Running in read-only environment. Modifications will persist in browser localStorage.' 
            }, { status: 200 });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: 'Server error', message: error.message }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const { id, updates } = await request.json();
        let data = readData();
        
        const fileIndex = data.findIndex((f: any) => f.id === id);
        if (fileIndex === -1) {
            return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }
        
        data[fileIndex] = { ...data[fileIndex], ...updates };
        const success = writeData(data);

        if (!success) {
            return NextResponse.json({ 
                error: 'ReadOnlyFileSystem', 
                message: 'Running in read-only environment. Modifications will persist in browser localStorage.',
                data: data[fileIndex]
            }, { status: 200 });
        }

        return NextResponse.json({ success: true, data: data[fileIndex] });
    } catch (error: any) {
        return NextResponse.json({ error: 'Server error', message: error.message }, { status: 500 });
    }
}
