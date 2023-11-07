export default function Footer () {
    const year = new Date().getFullYear();

    return (
        <div className="bg-gray-700 p-4 text-gray-200 text-center w-full">
            &copy;
            {' '}
            {year}
            {' '}
            TJ Draper
        </div>
    );
}
