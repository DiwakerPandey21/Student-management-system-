import Barcode from 'react-barcode';
import { FaUserCircle } from 'react-icons/fa';

const IdCard = ({ student }) => {
    return (
        <div className="bg-white w-[500px] h-[300px] border-2 border-gray-800 rounded-xl overflow-hidden relative shadow-2xl print:shadow-none print:border-gray-800 break-inside-avoid mb-6 transition-transform hover:scale-105 duration-300">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5 pointer-events-none flex items-center justify-center">
                <h1 className="text-8xl font-black transform -rotate-45">EDU</h1>
            </div>

            {/* Header */}
            <div className="bg-gray-900 text-white p-4 flex items-center justify-between h-[80px]">
                <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-white text-gray-900 flex items-center justify-center font-bold text-sm mr-3">
                        EM
                    </div>
                    <div>
                        <h2 className="text-lg font-bold uppercase tracking-widest">EduManager</h2>
                        <p className="text-[10px] text-gray-400 tracking-wide">Excellence in Education</p>
                    </div>
                </div>
                <div className="text-right">
                    <h3 className="text-xs font-bold bg-white text-gray-900 px-3 py-1 rounded tracking-wider">ID CARD</h3>
                </div>
            </div>

            {/* Content */}
            <div className="p-5 flex h-[160px] items-center">
                {/* Details */}
                <div className="flex-1 space-y-2 text-sm font-semibold text-gray-700 z-10">
                    <div className="flex items-baseline">
                        <span className="w-20 text-gray-500 text-xs uppercase tracking-wide">Name:</span>
                        <span className="uppercase text-gray-900 font-bold">{student.name}</span>
                    </div>
                    <div className="flex items-baseline">
                        <span className="w-20 text-gray-500 text-xs uppercase tracking-wide">ID No:</span>
                        <span className="font-mono text-gray-900">{student.studentId}</span>
                    </div>
                    <div className="flex items-baseline">
                        <span className="w-20 text-gray-500 text-xs uppercase tracking-wide">Phone:</span>
                        <span>{student.phone || 'N/A'}</span>
                    </div>
                    <div className="flex items-baseline">
                        <span className="w-20 text-gray-500 text-xs uppercase tracking-wide">Email:</span>
                        <span className="truncate w-40">{student.email}</span>
                    </div>
                    <div className="flex items-baseline">
                        <span className="w-20 text-gray-500 text-xs uppercase tracking-wide">DOB:</span>
                        <span>{student.dob ? new Date(student.dob).toLocaleDateString() : 'N/A'}</span>
                    </div>
                </div>

                {/* Photo Placeholder */}
                <div className="w-24 h-24 bg-gray-100 border-2 border-gray-200 rounded-lg flex items-center justify-center ml-4 z-10 shadow-inner overflow-hidden">
                    {student.profilePicture ? (
                        <img src={student.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                        <FaUserCircle className="text-6xl text-gray-300" />
                    )}
                </div>
            </div>

            {/* Footer / Barcode */}
            <div className="bg-white absolute bottom-0 w-full flex justify-center py-2 border-t border-dashed border-gray-300">
                <Barcode
                    value={student.studentId}
                    height={35}
                    width={1.5}
                    fontSize={12}
                    margin={0}
                    displayValue={true}
                    background="transparent"
                />
            </div>
        </div>
    );
};

export default IdCard;
